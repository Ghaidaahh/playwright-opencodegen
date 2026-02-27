# Amazon.com Test Plan

**Document Version:** 1.0  
**Date:** February 26, 2026  
**Target Website:** Amazon.com (https://www.amazon.com)  
**Test Framework:** Playwright  
**Scope:** End-to-End Functional Testing

---

## 1. Overview

This test plan covers comprehensive functional testing scenarios for Amazon.com e-commerce website. The test cases are designed to validate the core functionality of the website including homepage elements, search, product browsing, cart operations, user authentication, and checkout flow.

### Test Environment
- **Base URL:** https://www.amazon.com
- **Browser:** Chromium (configurable)
- **Target Country:** United States (default)

---

## 2. Test Suites

### 2.1 Homepage

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| HP-001 | Homepage Load | Verify Amazon homepage loads successfully with all core elements |
| HP-002 | Logo Presence | Verify Amazon logo is visible and clickable |
| HP-003 | Search Bar Functionality | Verify search bar is present and accepts input |
| HP-004 | Search Category Dropdown | Verify department selector dropdown contains all expected categories |
| HP-005 | Navigation Menu - Today's Deals | Verify "Today's Deals" link is present and navigates correctly |
| HP-006 | Navigation Menu - Prime Video | Verify "Prime Video" link is present and navigates correctly |
| HP-007 | Navigation Menu - Registry | Verify "Registry" link is present and navigates correctly |
| HP-008 | Navigation Menu - Gift Cards | Verify "Gift Cards" link is present and navigates correctly |
| HP-009 | Navigation Menu - Customer Service | Verify "Customer Service" link is present and navigates correctly |
| HP-010 | Navigation Menu - Sell | Verify "Sell" link is present and navigates correctly |
| HP-011 | Account & Lists Link | Verify "Hello, sign in" link is present |
| HP-012 | Cart Link | Verify cart link with item count is present |
| HP-013 | Returns & Orders Link | Verify "Returns & Orders" link is present |
| HP-014 | Language Selector | Verify language/country selector is present |
| HP-015 | Hero Section | Verify hero/featured content section is displayed |
| HP-016 | Best Sellers Section | Verify "Best Sellers" section is displayed on homepage |
| HP-017 | Category Tiles | Verify category tiles (Home, Kitchen, Fashion, etc.) are displayed |
| HP-018 | Footer Links Presence | Verify footer section contains expected links |

#### Test Steps - Homepage Load (HP-001)

**Preconditions:**
- Browser is launched and navigated to Amazon.com

**Test Steps:**
1. Navigate to https://www.amazon.com
2. Wait for page to fully load
3. Verify page title contains "Amazon"
4. Verify search bar is visible
5. Verify navigation menu is visible

**Expected Results:**
- Page loads without errors
- Page title should contain "Amazon.com"
- Search bar should be visible in header
- Navigation menu should be visible

---

### 2.2 Search Functionality

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| SF-001 | Basic Search | Verify basic keyword search returns relevant results |
| SF-002 | Search with Department Filter | Verify search within specific department works correctly |
| SF-003 | Empty Search | Verify behavior when searching with empty input |
| SF-004 | Search Results Sorting - Featured | Verify "Featured" sort option works correctly |
| SF-005 | Search Results Sorting - Price Low to High | Verify "Price: Low to High" sort option works correctly |
| SF-006 | Search Results Sorting - Price High to Low | Verify "Price: High to Low" sort option works correctly |
| SF-007 | Search Results Sorting - Customer Review | Verify "Avg. Customer Review" sort option works correctly |
| SF-008 | Search Results Sorting - Newest Arrivals | Verify "Newest Arrivals" sort option works correctly |
| SF-009 | Search Results Count | Verify search results are displayed |
| SF-010 | No Results Search | Verify behavior when search returns no results |
| SF-011 | Special Characters Search | Verify search handles special characters gracefully |
| SF-012 | Search Suggestions | Verify search suggestions appear while typing |

#### Test Steps - Basic Search (SF-001)

**Preconditions:**
- Amazon homepage is loaded

**Test Steps:**
1. Locate the search box element
2. Enter "laptop" in the search box
3. Click the "Go" button or press Enter
4. Wait for results to load
5. Verify search results page is displayed

**Expected Results:**
- URL should contain search parameter (s?k=laptop)
- Results should contain products related to "laptop"
- Search results heading should display the search term

#### Test Steps - Search Results Sorting (SF-004)

**Preconditions:**
- Search results page is displayed

**Test Steps:**
1. Perform a search (e.g., "laptop")
2. Locate the "Sort by" dropdown
3. Click on "Sort by" dropdown
4. Select "Featured" option
5. Verify results are sorted by featured

**Expected Results:**
- Sort dropdown should be visible
- Selecting "Featured" should update the results

---

### 2.3 Product Listing Page

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| PLP-001 | Product Cards Display | Verify product cards are displayed in search results |
| PLP-002 | Product Image | Verify product images are displayed |
| PLP-003 | Product Title | Verify product titles are displayed and clickable |
| PLP-004 | Product Price | Verify product prices are displayed |
| PLP-005 | Product Ratings | Verify product ratings are displayed |
| PLP-006 | Add to Cart Button | Verify "Add to Cart" buttons are present on product cards |
| PLP-007 | Prime Badge | Verify Prime eligible items show Prime badge |
| PLP-008 | Sponsored Products | Verify sponsored products are labeled appropriately |
| PLP-009 | Pagination | Verify pagination controls work correctly |
| PLP-010 | Product Link Navigation | Verify clicking product title navigates to product detail |

#### Test Steps - Product Cards Display (PLP-001)

**Preconditions:**
- Search results page is displayed

**Test Steps:**
1. Perform a search (e.g., "laptop")
2. Wait for results to load
3. Count the number of product cards displayed
4. Verify each card contains image, title, price

**Expected Results:**
- Multiple product cards should be visible
- Each card should contain image, title, price

---

### 2.4 Product Details Page

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| PDP-001 | Product Title Display | Verify product title is displayed correctly |
| PDP-002 | Product Price Display | Verify product price is displayed |
| PDP-003 | Product Images | Verify product images are displayed and interactive |
| PDP-004 | Image Thumbnail Navigation | Verify clicking thumbnails changes main image |
| PDP-005 | Star Ratings | Verify customer ratings are displayed |
| PDP-006 | Customer Reviews Section | Verify customer reviews section is present |
| PDP-007 | About This Item | Verify "About this item" section is displayed |
| PDP-008 | Product Specifications | Verify product specifications/technical details are shown |
| PDP-009 | Add to Cart Button | Verify "Add to Cart" button is present and clickable |
| PDP-010 | Buy Now Button | Verify "Buy Now" button is present |
| PDP-011 | Quantity Selector | Verify quantity selector is available |
| PDP-012 | Product Variants | Verify variant selection options work (size, color, etc.) |
| PDP-013 | Breadcrumb Navigation | Verify breadcrumbs show correct path |
| PDP-014 | Seller Information | Verify seller information is displayed |
| PDP-015 | Delivery Information | Verify delivery estimates are shown |

#### Test Steps - Add to Cart from PDP (PDP-009)

**Preconditions:**
- Product detail page is displayed

**Test Steps:**
1. Navigate to a product detail page (search for "laptop" and click a product)
2. Verify "Add to Cart" button is visible
3. Click the "Add to Cart" button
4. Verify cart count increases or success message appears

**Expected Results:**
- "Add to Cart" button should be visible
- Clicking should add item to cart
- Cart icon should show updated count

---

### 2.5 Shopping Cart

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| CART-001 | View Cart | Verify cart page displays added items |
| CART-002 | Cart Item Details | Verify correct product details are shown in cart |
| CART-003 | Cart Item Quantity - Increase | Verify quantity can be increased |
| CART-004 | Cart Item Quantity - Decrease | Verify quantity can be decreased |
| CART-005 | Remove Item from Cart | Verify item can be removed from cart |
| CART-006 | Cart Subtotal | Verify subtotal is calculated correctly |
| CART-007 | Cart Empty State | Verify appropriate message when cart is empty |
| CART-008 | Proceed to Checkout | Verify "Proceed to Checkout" button is present |
| CART-009 | Continue Shopping | Verify "Continue Shopping" button navigates back |
| CART-010 | Save for Later | Verify "Save for Later" option is available |

#### Test Steps - Add Item to Cart (CART-001)

**Preconditions:**
- Product detail page with "Add to Cart" button

**Test Steps:**
1. Navigate to any product detail page
2. Click "Add to Cart" button
3. Click on Cart icon in header
4. Verify cart page is displayed

**Expected Results:**
- Cart page should display the added product
- Product name, price, and quantity should be correct

---

### 2.6 User Authentication

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| AUTH-001 | Sign In Page Load | Verify sign-in page loads correctly |
| AUTH-002 | Valid Login | Verify login with valid credentials succeeds |
| AUTH-003 | Invalid Email Login | Verify error message for invalid email format |
| AUTH-004 | Invalid Password Login | Verify error message for incorrect password |
| AUTH-005 | Empty Credentials Login | Verify validation for empty fields |
| AUTH-006 | Sign Up Link | Verify "New customer? Start here" link works |
| AUTH-007 | Sign Up Form | Verify registration form is accessible |
| AUTH-008 | Forgot Password | Verify "Forgot your password?" link is present |
| AUTH-009 | Stay Signed In | Verify "Keep me signed in" checkbox functionality |
| AUTH-010 | Sign Out | Verify user can sign out successfully |

#### Test Steps - Sign In Page Load (AUTH-001)

**Preconditions:**
- Amazon homepage is loaded

**Test Steps:**
1. Click on "Hello, sign in" link in header
2. Verify sign-in page is displayed
3. Verify email/phone input field is present
4. Verify "Continue" button is present

**Expected Results:**
- Sign-in page should load
- Email input field should be visible
- "Continue" button should be visible

#### Test Steps - Invalid Email Login (AUTH-003)

**Preconditions:**
- Sign-in page is displayed

**Test Steps:**
1. Enter invalid email format (e.g., "test")
2. Click "Continue" button
3. Verify error message is displayed

**Expected Results:**
- Error message should indicate valid email/phone required

---

### 2.7 Checkout Flow

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| CHECK-001 | Checkout Page Load | Verify checkout page loads with cart items |
| CHECK-002 | Cart Summary | Verify order summary displays correctly |
| CHECK-003 | Shipping Address Form | Verify shipping address form fields are present |
| CHECK-004 | Payment Method Section | Verify payment method section is present |
| CHECK-005 | Place Order Button | Verify "Place your order" button is present |
| CHECK-006 | Order Total Calculation | Verify order total is calculated correctly |

#### Test Steps - Checkout Page Load (CHECK-001)

**Preconditions:**
- Items are added to cart, user is logged in

**Test Steps:**
1. Add item to cart
2. Click "Proceed to Checkout"
3. Verify checkout page loads

**Expected Results:**
- Checkout page should display cart items
- Order summary should be visible

---

### 2.8 Navigation

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| NAV-001 | Category Menu - All | Verify "All" menu expands with categories |
| NAV-002 | Category Navigation | Verify navigating through category works |
| NAV-003 | Breadcrumb Navigation | Verify breadcrumbs are clickable and accurate |
| NAV-004 | Back to Home | Verify clicking logo returns to homepage |
| NAV-005 | Keyboard Shortcuts | Verify keyboard shortcuts are documented |

#### Test Steps - Category Menu (NAV-001)

**Preconditions:**
- Amazon homepage is loaded

**Test Steps:**
1. Click on "All" button in navigation
2. Verify dropdown menu appears with categories
3. Verify categories are listed

**Expected Results:**
- All categories menu should expand
- Multiple category options should be visible

---

### 2.9 Account / Profile

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| ACC-001 | Order History Access | Verify access to order history |
| ACC-002 | Wishlist Access | Verify wishlist functionality is accessible |
| ACC-003 | Your Account Page | Verify "Your Account" page is accessible |
| ACC-004 | Prime Membership | Verify Prime membership section is accessible |

---

### 2.10 Footer Links

| Test Case ID | Test Case Name | Test Description |
|--------------|----------------|------------------|
| FOOT-001 | Amazon Footer - Get to Know Us | Verify "Get to Know Us" section is present |
| FOOT-002 | Amazon Footer - Make Money | Verify "Make Money with Us" section is present |
| FOOT-003 | Amazon Footer - Payment | Verify "Payment Products" section is present |
| FOOT-004 | Amazon Footer - Help | Verify "Let Us Help You" section is present |
| FOOT-005 | Footer Copyright | Verify copyright information is displayed |

---

## 3. Test Data Requirements

### Valid Test Credentials
- Email/Phone: [To be configured]
- Password: [To be configured]

### Test Search Terms
- Single word: "laptop", "phone", "books"
- Multiple words: "wireless headphones", "running shoes"
- Special characters: "@#$%", may need handling

### Test Products
- Product with variants (size/color)
- Prime eligible product
- Product with customer reviews

---

## 4. Non-Functional Requirements

### Performance
- Page load time should be under 3 seconds
- Search results should load within 2 seconds

### Compatibility
- Primary: Chromium browser
- Optional: Firefox, WebKit

---

## 5. Test Execution Guidelines

1. **Setup:** Before running tests, ensure browser is launched and base URL is accessible
2. **Execution:** Run tests in isolation where possible
3. **Cleanup:** Cart should be cleared between tests
4. **Assertions:** Use explicit waits for dynamic content
5. **Reporting:** Capture screenshots on test failures

---

## 6. Risk and Mitigations

| Risk | Mitigation |
|------|------------|
| Dynamic content (prices, availability) | Use flexible locators, avoid hard-coded values |
| Cart state persistence | Clear cart before each test |
| Network latency | Implement explicit waits |
| Location-based content | Consider setting consistent delivery address |

---

## 7. Test Coverage Summary

| Module | Number of Test Cases |
|--------|---------------------|
| Homepage | 18 |
| Search Functionality | 12 |
| Product Listing | 10 |
| Product Details | 15 |
| Shopping Cart | 10 |
| User Authentication | 10 |
| Checkout Flow | 6 |
| Navigation | 5 |
| Account/Profile | 4 |
| Footer Links | 5 |
| **Total** | **95** |

---

*End of Test Plan*
