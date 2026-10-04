"""Cognee Community Connector for Vercel Deployments."""
from .vercel import vercel_source, scrub_vercel_deployment, DOCUMENT_SOURCE_ATTR

__all__ = ["vercel_source", "scrub_vercel_deployment", "DOCUMENT_SOURCE_ATTR"]
