from github import Github
from backend.config import settings
import time

class GitHubService:
    def __init__(self):
        if settings.GITHUB_TOKEN:
            self.client = Github(settings.GITHUB_TOKEN)
        else:
            self.client = None
        
    def create_pull_request(self, incident_id: str, code_fix: str, target_file_path: str = "models/schema.yml") -> str:
        """
        Creates a branch, commits the fix, and opens a PR.
        """
        if not self.client:
            return "https://github.com/simulated-org/simulated-repo/pull/1" # Mock if no token for hackathon
            
        try:
            repo = self.client.get_repo(f"{settings.GITHUB_REPO_OWNER}/{settings.GITHUB_REPO_NAME}")
            
            # Create a new branch
            source_branch = repo.default_branch
            sb = repo.get_branch(source_branch)
            new_branch_name = f"fix/datahub-incident-{incident_id}-{int(time.time())}"
            repo.create_git_ref(ref=f"refs/heads/{new_branch_name}", sha=sb.commit.sha)
            
            # Create or update a file (in a real scenario, LLM would specify the file or we parse it)
            # We'll just append it to a mock file for the hackathon
            try:
                contents = repo.get_contents(target_file_path, ref=new_branch_name)
                repo.update_file(
                    contents.path,
                    f"Fix datahub incident {incident_id}",
                    code_fix,
                    contents.sha,
                    branch=new_branch_name
                )
            except Exception:
                repo.create_file(
                    target_file_path,
                    f"Fix datahub incident {incident_id}",
                    code_fix,
                    branch=new_branch_name
                )
                
            # Open PR
            pr = repo.create_pull(
                title=f"Fix: Data pipeline incident {incident_id}",
                body=f"This PR was generated automatically by DataHub Guard AI to fix incident {incident_id}.",
                head=new_branch_name,
                base=source_branch
            )
            return pr.html_url
        except Exception as e:
            print(f"Failed to create PR: {e}")
            return f"Error: {e}"
