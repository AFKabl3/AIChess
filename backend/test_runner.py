import requests
import re
import json

def parse_test_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    test_cases_raw = re.split(r'###\s*', content)
    test_cases = []
    for test_raw in test_cases_raw:
        test_raw = test_raw.strip()
        if not test_raw:
            continue
        lines = [line.strip() for line in test_raw.splitlines() if line.strip()]
        if not lines:
            continue
        description = lines[0]
        method_url = lines[1]
        method_url_parts = method_url.split()
        if len(method_url_parts) != 2:
            continue
        method, url = method_url_parts
        headers = {}
        body = None
        expected_response = None
        i = 2
        while i < len(lines):
            line = lines[i]
            if line.startswith('Content-Type:'):
                header_name, header_value = line.split(':', 1)
                headers[header_name.strip()] = header_value.strip()
                i += 1
            elif line.startswith('{') or line.startswith('['):
                body_lines = []
                while i < len(lines) and not lines[i].startswith('Response:'):
                    body_lines.append(lines[i])
                    i += 1
                body_raw = '\n'.join(body_lines)
                body = parse_json_with_types(body_raw)
            elif 'Response:' in line:
                response_content = line.partition('Response:')[2].strip()
                if response_content:
                    expected_response_lines = [response_content]
                    i += 1
                    while i < len(lines):
                        expected_response_lines.append(lines[i])
                        i += 1
                else:
                    i += 1
                    expected_response_lines = lines[i:]
                    i = len(lines)
                expected_response_raw = '\n'.join(expected_response_lines)
                expected_response = parse_json_with_types(expected_response_raw)
                break
            else:
                i += 1
        test_cases.append({
            'description': description,
            'method': method,
            'url': url,
            'headers': headers,
            'body': body,
            'expected_response': expected_response
        })
    return test_cases

def parse_json_with_types(raw_json):
    raw_json = re.sub(r",\s*([\]}])", r"\1", raw_json)
    raw_json = re.sub(r'(?<=:\s)(string|integer|float|boolean|null)(?=[,\s}])', r'"\1"', raw_json)
    try:
        data = json.loads(raw_json)
        data = mark_placeholders(data)
        return data
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        return raw_json.strip()

def mark_placeholders(data):
    if isinstance(data, dict):
        return {k: mark_placeholders(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [mark_placeholders(v) for v in data]
    elif isinstance(data, str):
        if data.strip() in ['string', 'integer', 'float', 'boolean', 'null']:
            return f'__TYPE_{data.strip()}__'
        return data
    else:
        return data

def compare_responses(actual, expected, path=''):
    if isinstance(expected, dict):
        if not isinstance(actual, dict):
            print(f"Type mismatch at {path}: expected dict, got {type(actual).__name__}")
            return False
        for key in expected:
            if key not in actual:
                print(f"Missing key at {path}: '{key}' not found in actual response")
                return False
            if not compare_responses(actual[key], expected[key], path=path+'.'+key):
                return False
        return True
    elif isinstance(expected, list):
        if not isinstance(actual, list):
            print(f"Type mismatch at {path}: expected list, got {type(actual).__name__}")
            return False
        if len(actual) != len(expected):
            print(f"Length mismatch at {path}: expected {len(expected)}, got {len(actual)}")
            return False
        for idx, (a_item, e_item) in enumerate(zip(actual, expected)):
            if not compare_responses(a_item, e_item, path=f"{path}[{idx}]"):
                return False
        return True
    elif isinstance(expected, str):
        if expected.startswith('__TYPE_') and expected.endswith('__'):
            expected_type = expected[7:-2]
            type_checks = {
                'string': lambda x: isinstance(x, str),
                'integer': lambda x: isinstance(x, int),
                'float': lambda x: isinstance(x, float),
                'boolean': lambda x: isinstance(x, bool),
                'null': lambda x: x is None,
            }
            result = type_checks.get(expected_type, lambda x: False)(actual)
            if not result:
                print(f"Type mismatch at {path}: expected {expected_type}, got {type(actual).__name__}")
            return result
        else:
            if actual != expected:
                print(f"Value mismatch at {path}: expected '{expected}', got '{actual}'")
                return False
            return True
    elif isinstance(expected, (int, float)):
        if not isinstance(actual, (int, float)):
            print(f"Type mismatch at {path}: expected numeric, got {type(actual).__name__}")
            return False
        if expected == 0:
            result = actual == 0
        else:
            tolerance = 0.20 * abs(expected)
            difference = abs(actual - expected)
            result = difference <= tolerance
            if not result:
                print(f"Value mismatch at {path}: expected {expected} ± {tolerance}, got {actual} (difference {difference})")
        return result
    else:
        result = actual == expected
        if not result:
            print(f"Value mismatch at {path}: expected '{expected}', got '{actual}'")
        return result

def run_tests(test_cases):
    total_tests = len(test_cases)
    passed_tests = 0
    for test in test_cases:
        description = test['description']
        method = test['method']
        url = test['url']
        headers = test['headers']
        body = test['body']
        expected_response = test['expected_response']
        print(f"Running test: {description}")
        print(f"URL: {url}")
        try:
            if method.upper() == 'POST':
                response = requests.post(url, json=body, headers=headers)
            elif method.upper() == 'GET':
                response = requests.get(url, headers=headers)
            else:
                print(f"{description}: UNSUPPORTED METHOD {method}")
                continue
            if 'application/json' in response.headers.get('Content-Type', ''):
                actual_response = response.json()
            else:
                actual_response = response.text.strip()
            if isinstance(expected_response, dict):
                print("Comparing responses...")
                if compare_responses(actual_response, expected_response):
                    print(f"{description}: PASS\n")
                    passed_tests += 1
                else:
                    print(f"{description}: FAIL")
                    print(f"Expected: {expected_response}\nGot: {actual_response}\n")
            else:
                if expected_response == actual_response:
                    print(f"{description}: PASS\n")
                    passed_tests += 1
                else:
                    print(f"{description}: FAIL")
                    print(f"Expected: {expected_response}\nGot: {actual_response}\n")
        except Exception as e:
            print(f"{description}: ERROR")
            print(f"Error: {e}\n")
    print(f"Summary: {passed_tests}/{total_tests} tests passed.")

if __name__ == '__main__':
    test_file = 'api.http'
    test_cases = parse_test_file(test_file)
    run_tests(test_cases)
