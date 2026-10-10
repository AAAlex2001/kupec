"""Репозиторий жалоб: запросы к таблице post_reports."""

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.posts.models import PostReport, ReportStatus


class PostReportRepository:
    """Доступ к таблице post_reports. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, report_id: int) -> PostReport | None:
        """Жалоба по id или None."""

        return await self.db.get(PostReport, report_id)

    async def add(self, report: PostReport) -> None:
        """Сохранить жалобу."""

        self.db.add(report)
        await self.db.commit()

    async def list_by_status(
        self, status: str, limit: int, offset: int
    ) -> tuple[list[PostReport], int]:
        """Жалобы в одном состоянии, новые первыми, и сколько их всего."""

        condition = PostReport.status == status
        stmt = (
            select(PostReport)
            .where(condition)
            .order_by(PostReport.created_at.desc(), PostReport.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(select(func.count()).select_from(PostReport).where(condition))

        return list(result.unique().scalars().all()), total or 0

    async def count_by_status(self) -> dict[str, int]:
        """Сколько жалоб в каждом состоянии."""

        stmt = select(PostReport.status, func.count()).group_by(PostReport.status)
        result = await self.db.execute(stmt)

        return {status: count for status, count in result.all()}

    async def resolve_post(self, post_id: int) -> None:
        """Закрыть все открытые жалобы на пост."""

        await self.db.execute(
            update(PostReport)
            .where(PostReport.post_id == post_id, PostReport.status == ReportStatus.OPEN)
            .values(status=ReportStatus.RESOLVED)
        )
        await self.db.commit()

    async def resolve_comment(self, comment_id: int) -> None:
        """Закрыть все открытые жалобы на комментарий."""

        await self.db.execute(
            update(PostReport)
            .where(PostReport.comment_id == comment_id, PostReport.status == ReportStatus.OPEN)
            .values(status=ReportStatus.RESOLVED)
        )
        await self.db.commit()
