-- ═══════════════════════════════════════════════════════════════════
--  SQLite3 PRACTICE QUERIES  —  practice.db
--  Run with:  sqlite3 practice.db
--  Then:      .read practice_queries.sql   (runs all at once)
--  Or paste individual queries at the sqlite> prompt
-- ═══════════════════════════════════════════════════════════════════

-- Recommended shell settings (run these first)
.headers on
.mode table

-- ─────────────────────────────────────────────
--  DATABASE OVERVIEW
-- ─────────────────────────────────────────────

-- What tables exist?
.tables

-- What does each table look like?
.schema employees
.schema orders

-- Row counts across all tables
SELECT 'departments' AS table_name, COUNT(*) AS rows FROM departments
UNION ALL SELECT 'employees',   COUNT(*) FROM employees
UNION ALL SELECT 'products',    COUNT(*) FROM products
UNION ALL SELECT 'customers',   COUNT(*) FROM customers
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;


-- ─────────────────────────────────────────────
--  BEGINNER QUERIES
-- ─────────────────────────────────────────────

-- 1. See all employees
SELECT * FROM employees;

-- 2. Just names and job titles
SELECT first_name, last_name, job_title FROM employees;

-- 3. Everyone in Engineering (dept_id = 1)
SELECT first_name, last_name, salary
FROM employees
WHERE dept_id = 1;

-- 4. Employees earning over $80,000
SELECT first_name, last_name, salary
FROM employees
WHERE salary > 80000
ORDER BY salary DESC;

-- 5. All products under $50
SELECT name, category, price
FROM products
WHERE price < 50
ORDER BY price;

-- 6. Count employees per department
SELECT dept_id, COUNT(*) AS headcount
FROM employees
GROUP BY dept_id;

-- 7. Find a customer by email
SELECT * FROM customers
WHERE email = 'james.a@email.com';

-- 8. All pending or processing orders
SELECT id, customer_id, order_date, status
FROM orders
WHERE status IN ('pending', 'processing');

-- 9. Products that are low on stock (under 30)
SELECT name, category, stock
FROM products
WHERE stock < 30
ORDER BY stock ASC;

-- 10. The 5 most expensive products
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 5;


-- ─────────────────────────────────────────────
--  INTERMEDIATE QUERIES
-- ─────────────────────────────────────────────

-- 11. Use the employee_roster VIEW (joins employees + departments)
SELECT * FROM employee_roster;

-- 12. Use the order_totals VIEW (joins orders + customers + items)
SELECT * FROM order_totals ORDER BY total DESC;

-- 13. Average salary by department
SELECT d.name AS department,
       ROUND(AVG(e.salary), 2) AS avg_salary,
       MIN(e.salary)           AS min_salary,
       MAX(e.salary)           AS max_salary,
       COUNT(*)                AS headcount
FROM employees e
JOIN departments d ON e.dept_id = d.id
GROUP BY d.id
ORDER BY avg_salary DESC;

-- 14. Total revenue per product (all time)
SELECT p.name, p.category,
       SUM(oi.quantity)              AS units_sold,
       SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.id
ORDER BY revenue DESC;

-- 15. Orders with full customer details and totals
SELECT o.id         AS order_id,
       o.order_date,
       o.status,
       c.first_name || ' ' || c.last_name AS customer,
       c.city,
       c.loyalty_tier,
       SUM(oi.quantity * oi.unit_price) + o.shipping_fee AS total
FROM orders o
JOIN customers c    ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.order_date DESC;

-- 16. Customers who have never placed an order
SELECT c.first_name, c.last_name, c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;

-- 17. Revenue by order status
SELECT status,
       COUNT(*)   AS order_count,
       SUM(oi.quantity * oi.unit_price) AS gross_revenue
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.status;

-- 18. Employees hired in the last 3 years
SELECT first_name, last_name, hire_date, job_title
FROM employees
WHERE hire_date >= DATE('now', '-3 years')
ORDER BY hire_date DESC;

-- 19. Profit margin per product
SELECT name,
       price,
       cost,
       ROUND(price - cost, 2)              AS margin,
       ROUND((price - cost) / price * 100, 1) AS margin_pct
FROM products
ORDER BY margin_pct DESC;

-- 20. Customers from Illinois or Texas
SELECT first_name, last_name, city, state, loyalty_tier
FROM customers
WHERE state IN ('IL', 'TX')
ORDER BY state, last_name;


-- ─────────────────────────────────────────────
--  ADVANCED QUERIES
-- ─────────────────────────────────────────────

-- 21. Employees earning above their department's average salary
SELECT e.first_name, e.last_name, e.salary,
       d.name AS department,
       ROUND(dept_avg.avg_sal, 2) AS dept_avg_salary
FROM employees e
JOIN departments d ON e.dept_id = d.id
JOIN (
  SELECT dept_id, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY dept_id
) dept_avg ON e.dept_id = dept_avg.dept_id
WHERE e.salary > dept_avg.avg_sal
ORDER BY e.salary DESC;

-- 22. Top customer by total spend using a CTE
WITH customer_spend AS (
  SELECT c.id,
         c.first_name || ' ' || c.last_name AS customer,
         c.loyalty_tier,
         COUNT(DISTINCT o.id)                  AS order_count,
         SUM(oi.quantity * oi.unit_price)       AS lifetime_spend
  FROM customers c
  JOIN orders o      ON c.id = o.customer_id
  JOIN order_items oi ON o.id = oi.order_id
  WHERE o.status != 'cancelled'
  GROUP BY c.id
)
SELECT customer, loyalty_tier, order_count,
       ROUND(lifetime_spend, 2) AS lifetime_spend
FROM customer_spend
ORDER BY lifetime_spend DESC;

-- 23. Running total of revenue by order date
WITH daily AS (
  SELECT o.order_date,
         SUM(oi.quantity * oi.unit_price) AS day_revenue
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  WHERE o.status NOT IN ('cancelled', 'pending')
  GROUP BY o.order_date
)
SELECT order_date,
       ROUND(day_revenue, 2) AS day_revenue,
       ROUND(SUM(day_revenue) OVER (ORDER BY order_date), 2) AS running_total
FROM daily
ORDER BY order_date;

-- 24. Rank employees by salary within each department
SELECT first_name, last_name, salary,
       d.name AS department,
       RANK() OVER (PARTITION BY e.dept_id ORDER BY salary DESC) AS dept_rank
FROM employees e
JOIN departments d ON e.dept_id = d.id
ORDER BY department, dept_rank;

-- 25. Products never ordered
SELECT p.name, p.category, p.stock
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.id IS NULL;

-- 26. Month-by-month order count and revenue in 2024
SELECT STRFTIME('%Y-%m', order_date)        AS month,
       COUNT(DISTINCT o.id)                 AS orders,
       SUM(oi.quantity * oi.unit_price)     AS gross_revenue
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE order_date LIKE '2024%'
GROUP BY month
ORDER BY month;

-- 27. Department payroll vs budget (how much budget is left?)
SELECT d.name,
       d.budget,
       SUM(e.salary)                          AS total_payroll,
       ROUND(d.budget - SUM(e.salary), 2)     AS remaining,
       ROUND(SUM(e.salary) / d.budget * 100, 1) AS pct_used
FROM departments d
LEFT JOIN employees e ON d.id = e.dept_id
GROUP BY d.id
ORDER BY pct_used DESC;

-- 28. Customers with more than one order
SELECT c.first_name || ' ' || c.last_name AS customer,
       COUNT(o.id)                         AS order_count,
       c.loyalty_tier
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
HAVING order_count > 1
ORDER BY order_count DESC;

-- 29. What did each Platinum/Gold customer buy?
SELECT c.first_name || ' ' || c.last_name AS customer,
       c.loyalty_tier,
       p.name      AS product,
       oi.quantity,
       oi.unit_price,
       o.order_date
FROM customers c
JOIN orders o       ON c.id  = o.customer_id
JOIN order_items oi ON o.id  = oi.order_id
JOIN products p     ON p.id  = oi.product_id
WHERE c.loyalty_tier IN ('Platinum', 'Gold')
ORDER BY customer, o.order_date;

-- 30. PRAGMA — inspect table structure
PRAGMA table_info(employees);
PRAGMA foreign_key_list(employees);
PRAGMA index_list(orders);


-- ─────────────────────────────────────────────
--  THINGS TO TRY YOURSELF
-- ─────────────────────────────────────────────
-- 1. Add a new employee to the employees table
-- 2. Give everyone in Engineering a 5% raise (UPDATE)
-- 3. Change an order's status from 'pending' to 'shipped'
--    (watch the audit_log trigger fire!)
-- 4. Create a new view showing only Electronics products
--    with their profit margin
-- 5. Add an index on customers.state and see if
--    EXPLAIN QUERY PLAN uses it
-- ═══════════════════════════════════════════════════════════════════
