"""
Legacy database connector wrapper.
Patches the original db_connector.get_db_connection() to use the SQLAlchemy
connection pool instead of creating a new psycopg2 connection each time.

All existing db_connector functions continue to work unchanged.
"""
import sys
from pathlib import Path

# Ensure the project root is on sys.path so we can import the original db_connector
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import the original module
import backend.database.legacy_connector as _original_db_connector

# Import our pooled connection provider
from backend.database.session import get_legacy_connection


def _patched_get_db_connection():
    """
    Drop-in replacement for the original get_db_connection().
    Returns a connection from the SQLAlchemy pool instead of creating a new one.
    """
    try:
        conn = get_legacy_connection()
        return conn
    except Exception as e:
        print(f"PostgreSQL 풀 연결 실패: {e}")
        return None


# Monkey-patch the original module's connection function
_original_db_connector.get_db_connection = _patched_get_db_connection


# Re-export all public functions from the original module so routers
# can do: from backend.database.legacy import get_customers_from_db, etc.
get_customers_from_db = _original_db_connector.get_customers_from_db
get_products_from_db = _original_db_connector.get_products_from_db
get_orders_from_db = _original_db_connector.get_orders_from_db
get_qnas_from_db = _original_db_connector.get_qnas_from_db
get_reviews_from_db = _original_db_connector.get_reviews_from_db
get_settlement_data_from_db = _original_db_connector.get_settlement_data_from_db
get_customers_by_segment = _original_db_connector.get_customers_by_segment
get_unanswered_qnas_count = _original_db_connector.get_unanswered_qnas_count
get_pending_claims_count = _original_db_connector.get_pending_claims_count
get_low_stock_products_count = _original_db_connector.get_low_stock_products_count
get_low_stock_products = _original_db_connector.get_low_stock_products
get_recent_negative_reviews = _original_db_connector.get_recent_negative_reviews
get_claims_by_customer = _original_db_connector.get_claims_by_customer
get_reviews_by_customer = _original_db_connector.get_reviews_by_customer
get_inquiries_by_status = _original_db_connector.get_inquiries_by_status
get_failure_logs_by_customer = _original_db_connector.get_failure_logs_by_customer
save_inquiry_log = _original_db_connector.save_inquiry_log
update_inquiry_log_feedback = _original_db_connector.update_inquiry_log_feedback
initialize_db_and_data = _original_db_connector.initialize_db_and_data
load_manuals_from_json = _original_db_connector.load_manuals_from_json
calculate_product_margins = _original_db_connector.calculate_product_margins
