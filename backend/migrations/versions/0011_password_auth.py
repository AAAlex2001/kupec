"""switch to password auth with email confirmation

Пользователи, которые уже входили по коду из письма, считаются подтвердившими почту.
Пароля у них нет — его задают через «Забыли пароль?».

Revision ID: 0011
Revises: 0010
Create Date: 2026-10-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.alter_column("users", "email_verified", server_default=sa.false())
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.add_column(
        "users", sa.Column("failed_logins", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column("users", sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True))

    op.execute("DELETE FROM auth_codes WHERE purpose = 'login'")
    op.drop_constraint("ck_auth_codes_purpose", "auth_codes", type_="check")
    op.create_check_constraint(
        "ck_auth_codes_purpose",
        "auth_codes",
        "purpose IN ('verify_email', 'reset_password', 'change_email')",
    )


def downgrade() -> None:
    op.execute("DELETE FROM auth_codes WHERE purpose IN ('verify_email', 'reset_password')")
    op.drop_constraint("ck_auth_codes_purpose", "auth_codes", type_="check")
    op.create_check_constraint(
        "ck_auth_codes_purpose", "auth_codes", "purpose IN ('login', 'change_email')"
    )
    op.drop_column("users", "locked_until")
    op.drop_column("users", "failed_logins")
    op.drop_column("users", "password_hash")
    op.drop_column("users", "email_verified")
