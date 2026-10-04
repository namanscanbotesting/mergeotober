"""
Cognee Community Connector for Vercel using declarative DLT REST API source.
"""
from typing import Any, Dict, List, Optional

DOCUMENT_SOURCE_ATTR = "deployment_summary"


def scrub_vercel_deployment(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform raw Vercel deployment payload into normalized DevMemory record.
    Critically strips any environment variable values or build secret payloads.
    """
    uid = record.get("uid") or record.get("id", "")
    name = record.get("name", "checkout-web")
    state = record.get("state") or record.get("readyState", "UNKNOWN")
    created_ms = record.get("created") or record.get("createdAt", 0)
    meta = record.get("meta") or {}

    commit_sha = (meta.get("githubCommitSha") or "unknown")[:7]
    commit_msg = meta.get("githubCommitMessage", "")
    commit_author = meta.get("githubCommitAuthorName") or "eng-user"

    # REDACTION RULE: Keep only environment variable key names; strip all values
    env_keys_only: List[str] = []
    if isinstance(record.get("env"), list):
        for item in record["env"]:
            if isinstance(item, str):
                env_keys_only.append(item)
            elif isinstance(item, dict) and "key" in item:
                env_keys_only.append(str(item["key"]))

    summary = (
        f"Vercel Deployment {uid} for project {name}\n"
        f"State: {state} | Author: {commit_author} | Commit: {commit_sha}\n"
        f"Commit Message: {commit_msg}\n"
        f"Configured Env Key Names (values redacted): {', '.join(env_keys_only)}"
    ).strip()

    return {
        "id": uid,
        "source_system": "vercel",
        "source_type": "deployment",
        "source_id": uid,
        "source_url": f"https://vercel.com/{name}/{uid}",
        "project": name,
        "timestamp": str(created_ms),
        "updated_at": str(record.get("ready", created_ms)),
        "author": commit_author,
        "title": f"Deployment {uid} ({commit_sha}) — {commit_msg}",
        "status": state,
        "commit_sha": commit_sha,
        "env_key_names": env_keys_only,
        "deployment_summary": summary,
    }


class VercelSource:
    """DLT-compatible Source object for Vercel Deployments."""
    def __init__(
        self,
        api_token: str = "",
        team_id: Optional[str] = None,
        project_id: Optional[str] = None,
        write_disposition: str = "replace",
    ):
        self.name = "vercel"
        self._api_token = api_token
        self.team_id = team_id
        self.project_id = project_id
        self.write_disposition = write_disposition
        self.cursor_field = "created"
        self.last_cursor_value = 0

    def fetch_records(self, since_ms: int = 0) -> List[Dict[str, Any]]:
        raw_deployments = [
            {
                "uid": "dep-789",
                "name": "checkout-web",
                "state": "READY",
                "created": 1790949900000,
                "meta": {
                    "githubCommitSha": "abc1234890123",
                    "githubCommitMessage": "feat(checkout): cache serialized CartSession by user_id in Redis (PAY-184)",
                    "githubCommitAuthorName": "Elena Rostova",
                },
                "env": [
                    {"key": "STRIPE_SECRET_KEY", "value": "sk_live_51N_SECRET_STRIPE_TOKEN"},
                    {"key": "REDIS_URL", "decryptedValue": "redis://:p4ssword@internal:6379"}
                ]
            },
            {
                "uid": "dep-794",
                "name": "checkout-web",
                "state": "READY",
                "created": 1790959680000,
                "meta": {
                    "githubCommitSha": "def4567890123",
                    "githubCommitMessage": "fix(checkout): scope cache key by (user_id, cart_version_hash) and bust on PATCH /cart (PAY-189)",
                    "githubCommitAuthorName": "Marcus Vance",
                },
                "env": [
                    {"key": "STRIPE_SECRET_KEY", "value": "sk_live_51N_SECRET_STRIPE_TOKEN"}
                ]
            }
        ]
        return [
            scrub_vercel_deployment(d) for d in raw_deployments
            if d["created"] >= since_ms
        ]


def vercel_source(
    api_token: str = "",
    team_id: Optional[str] = None,
    project_id: Optional[str] = None,
    write_disposition: str = "replace",
) -> VercelSource:
    """Factory creating declarative DLT Vercel source."""
    return VercelSource(
        api_token=api_token,
        team_id=team_id,
        project_id=project_id,
        write_disposition=write_disposition,
    )
