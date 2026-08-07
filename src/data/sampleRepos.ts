import { SampleRepo } from '../types';

export const SAMPLE_REPOS: SampleRepo[] = [
  {
    id: 'python-calculator-bugs',
    name: 'python-calc-service',
    description: 'Python financial calculator service with division-by-zero crash & type conversion bugs.',
    language: 'python',
    files: [
      {
        path: 'calculator/core.py',
        language: 'python',
        hasBug: true,
        bugDescription: 'Division by zero on 0 denominator & string numbers passed without type casting in compound interest calculation.',
        content: `class FinancialCalculator:
    """Core financial calculation engine with interest and tax metrics."""

    def __init__(self, currency: str = "USD"):
        self.currency = currency

    def calculate_compound_interest(self, principal: float, rate: float, time: int, n: int) -> float:
        # BUG: Missing check for n <= 0 causes ZeroDivisionError
        # BUG: Fails when string numbers are passed from API payload
        amount = principal * (1 + (rate / n)) ** (n * time)
        return round(amount, 2)

    def calculate_debt_ratio(self, total_debt: float, total_income: float) -> float:
        # BUG: Crashes with ZeroDivisionError when total_income is 0
        ratio = total_debt / total_income
        return round(ratio, 4)

    def parse_api_payload(self, payload: dict) -> float:
        # BUG: Fails with KeyError if 'principal' or 'rate' is missing
        p = payload['principal']
        r = payload['rate']
        t = payload['time']
        n = payload['n']
        return self.calculate_compound_interest(p, r, t, n)
`,
        testFile: 'tests/test_core.py',
        testContent: `import pytest
from calculator.core import FinancialCalculator

def test_compound_interest_normal():
    calc = FinancialCalculator()
    res = calc.calculate_compound_interest(1000, 0.05, 2, 12)
    assert res == 1104.94

def test_compound_interest_zero_n():
    calc = FinancialCalculator()
    # Should safely handle n=0 or invalid n by raising ValueError or returning principal
    with pytest.raises(ValueError):
        calc.calculate_compound_interest(1000, 0.05, 2, 0)

def test_debt_ratio_zero_income():
    calc = FinancialCalculator()
    # Should return 0.0 or raise safe ValueError instead of ZeroDivisionError
    res = calc.calculate_debt_ratio(500, 0)
    assert res == 0.0

def test_parse_api_payload_string_types():
    calc = FinancialCalculator()
    payload = {"principal": "1000", "rate": "0.05", "time": "2", "n": "12"}
    # Should cast string inputs cleanly to float/int
    res = calc.parse_api_payload(payload)
    assert res == 1104.94
`
      },
      {
        path: 'calculator/utils.py',
        language: 'python',
        hasBug: false,
        content: `import json
import re

def safe_json_extract(raw_response: str) -> dict:
    """Robust JSON extraction helper using regex to locate outer braces."""
    if not raw_response:
        return {}
    match = re.search(r'\\{[\\s\\S]*\\}', raw_response)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            # Pragmatic developer fallback: clean trailing commas
            cleaned = re.sub(r',\\s*([\\}\\]])', r'\\1', match.group(0))
            return json.loads(cleaned)
    return {}
`
      }
    ]
  },
  {
    id: 'fastapi-user-auth',
    name: 'fastapi-auth-service',
    description: 'FastAPI authentication & JWT token validator with signature bypass vulnerability.',
    language: 'python',
    files: [
      {
        path: 'auth/jwt_handler.py',
        language: 'python',
        hasBug: true,
        bugDescription: 'Insecure JWT verification allowing "none" algorithm and unhandled token expiry exceptions.',
        content: `import time
import jwt

SECRET_KEY = "dev-secret-change-in-prod"
ALGORITHM = "HS256"

class TokenHandler:
    def create_access_token(self, user_id: str, expires_in: int = 3600) -> str:
        payload = {
            "sub": user_id,
            "exp": time.time() + expires_in
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    def decode_token(self, token: str) -> dict:
        # BUG: Vulnerable to algorithm substitution ("none")
        # BUG: Fails without catching ExpiredSignatureError cleanly
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256", "none"])
        return decoded
`,
        testFile: 'tests/test_jwt.py',
        testContent: `import pytest
import time
from auth.jwt_handler import TokenHandler

def test_valid_token_decode():
    handler = TokenHandler()
    token = handler.create_access_token("user_123")
    decoded = handler.decode_token(token)
    assert decoded["sub"] == "user_123"

def test_expired_token_handling():
    handler = TokenHandler()
    token = handler.create_access_token("user_123", expires_in=-10)
    with pytest.raises(ValueError, match="Token has expired"):
        handler.decode_token(token)

def test_reject_none_algorithm():
    handler = TokenHandler()
    # Malicious token generated with none algorithm
    malicious_token = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9."
    with pytest.raises(ValueError):
        handler.decode_token(malicious_token)
`
      }
    ]
  },
  {
    id: 'data-pipeline-etl',
    name: 'pandas-data-cleaner',
    description: 'Pandas ETL data cleaning pipeline crashing on missing columns and None values.',
    language: 'python',
    files: [
      {
        path: 'pipeline/cleaner.py',
        language: 'python',
        hasBug: true,
        bugDescription: 'Uncaught TypeError when processing null fields in user email normalization.',
        content: `class DataCleaner:
    def __init__(self, raw_records: list):
        self.records = raw_records

    def normalize_emails(self) -> list:
        cleaned = []
        for record in self.records:
            # BUG: Crashes with AttributeError when email is None
            email = record['email'].strip().lower()
            if '@' in email:
                cleaned.append(email)
        return cleaned

    def compute_average_salary((self) -> float:
        total = 0
        count = 0
        for record in self.records:
            # BUG: Syntax error in function def above & crashes if 'salary' key missing or string
            total += record['salary']
            count += 1
        return total / count if count > 0 else 0.0
`,
        testFile: 'tests/test_cleaner.py',
        testContent: `import pytest
from pipeline.cleaner import DataCleaner

def test_normalize_emails_with_none():
    records = [
        {"email": " ALICE@Example.com "},
        {"email": None},
        {"email": "bob@test.org"}
    ]
    cleaner = DataCleaner(records)
    res = cleaner.normalize_emails()
    assert res == ["alice@example.com", "bob@test.org"]

def test_salary_missing_keys():
    records = [
        {"salary": 50000},
        {"salary": "60000"},
        {"other": 100}
    ]
    cleaner = DataCleaner(records)
    avg = cleaner.compute_average_salary()
    assert avg == 55000.0
`
      }
    ]
  }
];
