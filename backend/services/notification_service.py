import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.notification import Notification
from schemas.notification import NotificationListOut, NotificationOut


async def create_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    notification_type: str,
    title: str,
    message: str,
    submission_id: uuid.UUID | None = None,
) -> Notification:
    notification = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        submission_id=submission_id,
        is_read=False,
    )
    db.add(notification)
    await db.flush()
    return notification


async def get_user_notifications(
    db: AsyncSession,
    user_id: uuid.UUID,
    include_read: bool = True,
) -> NotificationListOut:
    query = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    if not include_read:
        query = query.where(Notification.is_read == False)  # noqa: E712

    result = await db.execute(query)
    notifications = result.scalars().all()
    unread = sum(1 for n in notifications if not n.is_read)
    return NotificationListOut(
        items=[NotificationOut.model_validate(n) for n in notifications],
        unread_count=unread,
    )


async def mark_as_read(
    db: AsyncSession,
    notification_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Notification:
    from fastapi import HTTPException, status as http_status

    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    await db.flush()
    return notification
