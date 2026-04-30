"""
Testing script for the Smart Food Recognition API.
Run this to verify all endpoints are working correctly.

Usage:
    python test_api.py
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"


class APITester:
    """Test suite for the Food Recognition API"""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
    
    def print_response(self, title: str, response: requests.Response, pretty: bool = True):
        """Pretty print API response"""
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        print(f"URL: {response.url}\n")
        
        try:
            if pretty:
                print(json.dumps(response.json(), indent=2))
            else:
                print(response.text)
        except:
            print(response.text)
    
    def test_health_check(self):
        """Test 1: Health check endpoint"""
        response = self.session.get(f"{self.base_url}/health")
        self.print_response("TEST 1: Health Check", response)
        return response.status_code == 200
    
    def test_root(self):
        """Test 2: Root endpoint"""
        response = self.session.get(f"{self.base_url}/")
        self.print_response("TEST 2: Root Endpoint", response)
        return response.status_code == 200
    
    def test_list_all_foods(self):
        """Test 3: List all foods"""
        response = self.session.get(f"{self.base_url}/api/v1/foods")
        self.print_response("TEST 3: List All Foods", response)
        return response.status_code == 200 and len(response.json()) > 0
    
    def test_get_food_info(self, food_name: str = "apple"):
        """Test 4: Get food information"""
        response = self.session.get(f"{self.base_url}/api/v1/foods/{food_name}")
        self.print_response(f"TEST 4: Get Food Info ({food_name})", response)
        return response.status_code == 200
    
    def test_get_invalid_food(self):
        """Test 5: Get invalid food (should return 404)"""
        response = self.session.get(f"{self.base_url}/api/v1/foods/invalid_xyz_food")
        self.print_response("TEST 5: Get Invalid Food (Expected 404)", response)
        return response.status_code == 404
    
    def test_get_recipes(self, food_name: str = "apple"):
        """Test 6: Get recipes for a food"""
        response = self.session.get(f"{self.base_url}/api/v1/recipes/{food_name}")
        self.print_response(f"TEST 6: Get Recipes ({food_name})", response)
        return response.status_code == 200
    
    def test_get_recipes_with_filters(self):
        """Test 7: Get recipes with appliance and health filters"""
        url = f"{self.base_url}/api/v1/recipes/apple"
        params = {
            "appliances": "knife",
            "health_tags": "quick"
        }
        response = self.session.get(url, params=params)
        self.print_response("TEST 7: Get Recipes with Filters", response)
        return response.status_code == 200
    
    def test_low_calorie(self):
        """Test 8: Get low-calorie foods"""
        response = self.session.get(f"{self.base_url}/api/v1/low-calorie")
        self.print_response("TEST 8: Low-Calorie Foods", response)
        return response.status_code == 200
    
    def test_low_sugar(self):
        """Test 9: Get low-sugar foods"""
        response = self.session.get(f"{self.base_url}/api/v1/low-sugar")
        self.print_response("TEST 9: Low-Sugar Foods", response)
        return response.status_code == 200
    
    def test_prediction_basic(self):
        """Test 10: Basic prediction (no filters)"""
        payload = {
            "image_base64": None,
            "health_constraints": [],
            "available_appliances": []
        }
        response = self.session.post(
            f"{self.base_url}/api/v1/predict",
            json=payload
        )
        self.print_response("TEST 10: Basic Prediction", response)
        return response.status_code == 200
    
    def test_prediction_with_constraints(self):
        """Test 11: Prediction with health constraints"""
        payload = {
            "image_base64": None,
            "health_constraints": ["low-sugar", "diabetic-friendly"],
            "available_appliances": []
        }
        response = self.session.post(
            f"{self.base_url}/api/v1/predict",
            json=payload
        )
        self.print_response("TEST 11: Prediction with Health Constraints", response)
        return response.status_code == 200
    
    def test_prediction_with_appliances(self):
        """Test 12: Prediction with available appliances"""
        payload = {
            "image_base64": None,
            "health_constraints": [],
            "available_appliances": ["blender", "knife"]
        }
        response = self.session.post(
            f"{self.base_url}/api/v1/predict",
            json=payload
        )
        self.print_response("TEST 12: Prediction with Appliances", response)
        return response.status_code == 200
    
    def test_prediction_full(self):
        """Test 13: Prediction with all filters"""
        payload = {
            "image_base64": None,
            "health_constraints": ["healthy", "quick"],
            "available_appliances": ["knife", "cutting-board"]
        }
        response = self.session.post(
            f"{self.base_url}/api/v1/predict",
            json=payload
        )
        self.print_response("TEST 13: Full Prediction (All Filters)", response)
        return response.status_code == 200
    
    def run_all_tests(self):
        """Run all test cases"""
        tests = [
            ("Health Check", self.test_health_check),
            ("Root Endpoint", self.test_root),
            ("List All Foods", self.test_list_all_foods),
            ("Get Food Info", self.test_get_food_info),
            ("Get Invalid Food", self.test_get_invalid_food),
            ("Get Recipes", self.test_get_recipes),
            ("Get Recipes with Filters", self.test_get_recipes_with_filters),
            ("Low Calorie Foods", self.test_low_calorie),
            ("Low Sugar Foods", self.test_low_sugar),
            ("Basic Prediction", self.test_prediction_basic),
            ("Prediction with Constraints", self.test_prediction_with_constraints),
            ("Prediction with Appliances", self.test_prediction_with_appliances),
            ("Full Prediction", self.test_prediction_full),
        ]
        
        results = {}
        passed = 0
        failed = 0
        
        print("\n" + "="*60)
        print("  SMART FOOD RECOGNITION API - TEST SUITE")
        print("="*60)
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                results[test_name] = "✓ PASS" if result else "✗ FAIL"
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                results[test_name] = f"✗ ERROR: {str(e)}"
                failed += 1
        
        # Print summary
        print(f"\n{'='*60}")
        print("  TEST SUMMARY")
        print(f"{'='*60}")
        
        for test_name, result in results.items():
            print(f"{test_name:.<40} {result}")
        
        print(f"{'='*60}")
        print(f"Total: {passed + failed} | Passed: {passed} | Failed: {failed}")
        print(f"{'='*60}\n")
        
        return passed, failed


def main():
    """Main test runner"""
    print("\n⚠️  Make sure the API server is running:")
    print("   python -m uvicorn app.main:app --reload")
    print("\n⚠️  Make sure MongoDB is running and .env is configured")
    print("\nStarting tests...\n")
    
    tester = APITester()
    
    try:
        passed, failed = tester.run_all_tests()
        
        if failed == 0:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {failed} test(s) failed")
            return 1
    
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Cannot reach API server")
        print("   Make sure the server is running on http://localhost:8000")
        return 1
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 1


if __name__ == "__main__":
    exit(main())
