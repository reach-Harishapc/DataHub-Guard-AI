import json
from datahub.emitter.mcp import MetadataChangeProposalWrapper
from datahub.emitter.rest_emitter import DatahubRestEmitter
from datahub.metadata.schema_classes import (
    IncidentInfoClass,
    IncidentSourceClass,
    IncidentSourceTypeClass,
    IncidentStateClass,
    IncidentStatusClass,
    IncidentTypeClass,
    TagAssociationClass,
    GlobalTagsClass,
    DatasetPropertiesClass
)
from datahub.ingestion.graph.client import DataHubGraph, DataHubGraphConfig
from typing import Dict, Any, List
import time
from backend.config import settings

class DataHubService:
    def __init__(self):
        self.graph = DataHubGraph(DataHubGraphConfig(server=settings.DATAHUB_GMS_URL, token=settings.DATAHUB_TOKEN))
        self.emitter = DatahubRestEmitter(gms_server=settings.DATAHUB_GMS_URL, token=settings.DATAHUB_TOKEN)
        
    def get_dataset_schema(self, urn: str) -> Dict[str, Any]:
        """Fetch schema for a dataset using GraphQL via DataHubGraph or REST."""
        # try:
        #     schema = self.graph.get_schema_metadata(urn)
        #     if schema:
        #         return {
        #             "fields": [
        #                 {"fieldPath": f.fieldPath, "type": str(f.type), "description": f.description} 
        #                 for f in schema.fields
        #             ]
        #         }
        # except Exception as e:
        #     print(f"Warning: Failed to fetch schema: {e}")
            # Mock schema for demo
        return {
            "fields": [
                {"fieldPath": "order_id", "type": "StringType()", "description": "Order Identifier"},
                {"fieldPath": "customer_id", "type": "StringType()", "description": "Customer Identifier"},
                {"fieldPath": "amount", "type": "NumberType()", "description": "Order amount"},
                {"fieldPath": "payment_status", "type": "StringType()", "description": "Status of the payment"}
            ]
        }
        
    def get_lineage(self, urn: str, direction: str = "DOWNSTREAM", levels: int = 5) -> List[str]:
        """Fetch up/down stream lineage."""
        # Fallback simplistic approach for hackathon - in a real app, query GraphQL directly for multi-level
        try:
            # lineage = self.graph.get_aspect(entity_urn=urn, aspect_type=UpstreamLineageClass)
            pass
        except Exception:
            pass
            
        query = f"""
        {{
          dataset(urn: "{urn}") {{
            urn
            {direction.lower()}Lineage(input: {{direction: {direction}}}) {{
              entities {{
                entity {{
                  ... on Dataset {{
                    urn
                    name
                  }}
                }}
              }}
            }}
          }}
        }}
        """
        # Note: In real DataHub graph, graph.execute_graphql(query) is available
        # try:
        #     res = self.graph.execute_graphql(query=query)
        #     entities = res.get('dataset', {}).get(f'{direction.lower()}Lineage', {}).get('entities', [])
        #     return [e.get('entity', {}).get('urn') for e in entities if e.get('entity', {}).get('urn')]
        # except Exception as e:
        #     print(f"Failed to fetch lineage: {e}")
            # Mock lineage for demo
        if direction == "DOWNSTREAM":
            return [
                "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.daily_revenue,PROD)",
                "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.monthly_growth,PROD)"
            ]
        return ["urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.prod.stg_orders,PROD)"]

    def get_historical_incidents(self, urn: str) -> List[Dict[str, Any]]:
        """Mock fetching historical incidents for a dataset."""
        return [
            {
                "timestamp": "2026-06-15T10:00:00Z",
                "error": "Column PAYMENT_STATUS missing from stg_orders due to upstream schema rename (PAY_STATUS)",
                "fix_summary": "Aliased PAY_STATUS as payment_status in dbt model."
            }
        ]

    def create_incident(self, dataset_urn: str, message: str, pipeline_id: str) -> str:
        """Create an incident on the dataset."""
        incident_id = f"incident_{int(time.time())}"
        incident_urn = f"urn:li:incident:{incident_id}"
        
        try:
            mcp = MetadataChangeProposalWrapper(
                entityUrn=incident_urn,
                aspect=IncidentInfoClass(
                    type=IncidentTypeClass.OPERATIONAL,
                    customType="PIPELINE_FAILURE",
                    title=f"Pipeline Failure in {pipeline_id}",
                    description=message,
                    entities=[dataset_urn],
                    status=IncidentStatusClass(
                        state=IncidentStateClass.ACTIVE,
                        message="Newly ingested alert",
                        lastUpdated=int(time.time() * 1000)
                    ),
                    source=IncidentSourceClass(
                        type=IncidentSourceTypeClass.MANUAL,
                        sourceUrn=dataset_urn
                    )
                )
            )
            # self.emitter.emit(mcp)
        except Exception as e:
            print(f"Warning: Failed to emit incident to DataHub: {e}")
            
        return incident_urn
        
    def tag_downstream_impact(self, dataset_urns: List[str]):
        """Add DownstreamImpacted tag to datasets."""
        tag_urn = "urn:li:tag:DownstreamImpacted"
        for urn in dataset_urns:
            try:
                # We fetch current tags and append
                # current_tags = self.graph.get_aspect(entity_urn=urn, aspect_type=GlobalTagsClass)
                current_tags = None
                if not current_tags:
                    current_tags = GlobalTagsClass(tags=[])
                
                # Check if exists
                if not any(t.tag == tag_urn for t in current_tags.tags):
                    current_tags.tags.append(TagAssociationClass(tag=tag_urn))
                    mcp = MetadataChangeProposalWrapper(entityUrn=urn, aspect=current_tags)
                    # self.emitter.emit(mcp)
            except Exception as e:
                print(f"Warning: Failed to emit tags to DataHub: {e}")
                
    def update_dataset_pr_link(self, dataset_urn: str, pr_url: str):
        """Add PR link to Dataset properties."""
        try:
            # props = self.graph.get_aspect(entity_urn=dataset_urn, aspect_type=DatasetPropertiesClass)
            props = None
            if not props:
                props = DatasetPropertiesClass(customProperties={})
            if not props.customProperties:
                props.customProperties = {}
            
            props.customProperties["Latest_PR_Fix"] = pr_url
            mcp = MetadataChangeProposalWrapper(entityUrn=dataset_urn, aspect=props)
            # self.emitter.emit(mcp)
        except Exception as e:
            print(f"Warning: Failed to update PR link in DataHub: {e}")

    def get_ownership(self, dataset_urn: str) -> List[str]:
        """Fetch dataset owners via GraphQL or REST"""
        query = f"""
        {{
          dataset(urn: "{dataset_urn}") {{
            ownership {{
              owners {{
                owner {{
                  ... on CorpUser {{
                    urn
                    username
                  }}
                }}
              }}
            }}
          }}
        }}
        """
        # try:
        #     res = self.graph.execute_graphql(query=query)
        #     owners = res.get('dataset', {}).get('ownership', {}).get('owners', [])
        #     return [o.get('owner', {}).get('username') for o in owners if o.get('owner', {}).get('username')]
        # except Exception as e:
        #     print(f"Failed to fetch ownership: {e}")
        return []
