"""long ids

Номера пользователей, публикаций и объявлений — шестизначные: к уже выданным прибавляется 100000,
новые идут дальше по порядку. Внешние ключи на время перенумерации получают ON UPDATE CASCADE,
чтобы Postgres сам обновил все ссылки, затем возвращаются в прежний вид. Зрители объявлений
хранятся строкой «user:1» — их номера обновляются отдельно.

Revision ID: 0029
Revises: 0028
Create Date: 2026-10-11
"""

from typing import Sequence, Union

from alembic import op

revision: str = "0029"
down_revision: Union[str, None] = "0028"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OFFSET = 100000
TABLES = ("users", "posts", "listings")

RENUMBER = """
DO $$
DECLARE
    fk record;
BEGIN
    CREATE TEMP TABLE renumber_fks AS
    SELECT c.conrelid::regclass AS child, c.conname AS name, pg_get_constraintdef(c.oid) AS definition
    FROM pg_constraint c
    WHERE c.contype = 'f' AND c.confrelid = '{table}'::regclass;

    FOR fk IN SELECT * FROM renumber_fks LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.child, fk.name);
        EXECUTE format(
            'ALTER TABLE %s ADD CONSTRAINT %I %s ON UPDATE CASCADE', fk.child, fk.name, fk.definition
        );
    END LOOP;

    UPDATE {table} SET id = id + {offset} WHERE id <= {offset};

    FOR fk IN SELECT * FROM renumber_fks LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.child, fk.name);
        EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s', fk.child, fk.name, fk.definition);
    END LOOP;

    DROP TABLE renumber_fks;

    PERFORM setval(
        pg_get_serial_sequence('{table}', 'id'),
        GREATEST((SELECT max(id) FROM {table}), {offset})
    );
END $$;
"""


VISITORS = """
UPDATE listing_views
SET visitor = 'user:' || (substring(visitor from 6)::int + {offset})
WHERE visitor ~ '^user:[0-9]+$' AND substring(visitor from 6)::int <= {offset};
"""


def upgrade() -> None:
    for table in TABLES:
        op.execute(RENUMBER.format(table=table, offset=OFFSET))

    op.execute(VISITORS.format(offset=OFFSET))


def downgrade() -> None:
    """Номера не возвращаем: на шестизначные уже могут ссылаться внешние ссылки и закладки."""
