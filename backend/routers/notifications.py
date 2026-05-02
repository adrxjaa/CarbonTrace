import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.deps import CurrentUser
from schemas.notification import NotificationListOut, NotificationOut
from services.notification_service import get_user_notifications, mark_as_read

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=NotificationListOut,
    summary="Fetch all notifications for the current user",
)
async def list_notifications(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    unread_only: bool = Query(default=False, description="Return only unread notifications"),
) -> NotificationListOut:
    return await get_user_notifications(db, current_user.id, include_read=not unread_only)


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationOut,
    summary="Mark a notification as read",
)
async def mark_read(
    notification_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> NotificationOut:
    notification = await mark_as_read(db, notification_id, current_user.id)
    return NotificationOut.model_validate(notification)
