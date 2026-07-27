from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # DataHub
    DATAHUB_GMS_URL: str = "http://localhost:8080"
    DATAHUB_TOKEN: str = ""

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"

    # GitHub
    GITHUB_TOKEN: str = ""
    GITHUB_REPO_OWNER: str = ""
    GITHUB_REPO_NAME: str = ""

    # Optional
    SLACK_WEBHOOK_URL: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
