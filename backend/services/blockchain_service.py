"""
Blockchain simulation service.

Generates a deterministic UUID-based tx_hash and marks submissions as on_chain.
In Stage 2, replace simulate_on_chain_commit() with a real Ethereum transaction
via web3.py / ethers.js bridge.
"""
import hashlib
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from models.submission import Submission


def _generate_tx_hash(submission_id: uuid.UUID) -> str:
    """
    Produce a deterministic, Ethereum-style hex hash from the submission UUID.
    Prefixed with '0x' to look like a real tx hash.
    """
    raw = f"carbontrace:{submission_id}:{uuid.uuid4()}"
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return f"0x{digest}"


async def simulate_on_chain_commit(
    db: AsyncSession,
    submission: Submission,
) -> str:
    """
    Simulate committing a verified submission to the blockchain.
    Sets tx_hash and on_chain = True on the submission.
    Returns the generated tx_hash.
    """
    tx_hash = _generate_tx_hash(submission.id)
    now = datetime.now(timezone.utc)

    submission.tx_hash = tx_hash
    submission.on_chain = True
    submission.chain_committed_at = now

    await db.flush()

    print(f"[BlockchainService] Committed submission {submission.id} → tx: {tx_hash}")
    return tx_hash
