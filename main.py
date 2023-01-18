from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("https://practice.geeksforgeeks.org/problem-of-the-day")

# Wait for the button to be visible
WebDriverWait(driver, 10).until(EC.presence_of_element_located(
    (By.CSS_SELECTOR, ".ui.button.currentProblemCntBtn")))

solve_problem_button = driver.find_element(
    By.CSS_SELECTOR, ".ui.button.currentProblemCntBtn")

print(solve_problem_button)
solve_problem_button.click()

current_url = driver.current_url
print(current_url)

driver.quit()
