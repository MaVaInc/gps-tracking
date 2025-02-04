"""add maintenance intervals

Revision ID: xyz123
Revises: previous_revision
Create Date: 2024-02-04 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Добавляем новые колонки
    op.add_column('vehicles', sa.Column('next_oil_change', sa.Float, default=10000))
    op.add_column('vehicles', sa.Column('next_brake_change', sa.Float, default=20000))
    op.add_column('vehicles', sa.Column('next_timing_belt_change', sa.Float, default=60000))
    op.add_column('vehicles', sa.Column('next_filter_change', sa.Float, default=15000))
    op.add_column('vehicles', sa.Column('next_clutch_change', sa.Float, default=80000))
    op.add_column('vehicles', sa.Column('next_battery_change', sa.Float, default=40000))
    op.add_column('vehicles', sa.Column('next_tires_change', sa.Float, default=30000))
    op.add_column('vehicles', sa.Column('next_shock_absorbers_change', sa.Float, default=50000))

def downgrade():
    # Удаляем колонки при откате
    op.drop_column('vehicles', 'next_oil_change')
    op.drop_column('vehicles', 'next_brake_change')
    op.drop_column('vehicles', 'next_timing_belt_change')
    op.drop_column('vehicles', 'next_filter_change')
    op.drop_column('vehicles', 'next_clutch_change')
    op.drop_column('vehicles', 'next_battery_change')
    op.drop_column('vehicles', 'next_tires_change')
    op.drop_column('vehicles', 'next_shock_absorbers_change') 