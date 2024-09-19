# BearNovelWebsite
小熊小說網

# 專案簡介

這個專案是一個基於 ASP.NET 6 和 React 的應用程序，包含身份驗證、授權和數據存儲功能。以下是專案的主要組成部分和技術棧。

## 後端 (ASP.NET 6)

### 1. 身份驗證和授權
- **使用 ASP.NET Core Identity**：進行用戶管理。
- **實現 JWT 認證**：便於與 React 前端集成。
- **使用 IdentityServer**：提供身份驗證和授權功能。

### 2. API 設計
- **實現 RESTful API**：遵循 RESTful 設計原則。
- **使用控制器處理 HTTP 請求**：負責處理前端發送的請求。

### 3. 數據存儲
- **使用 Entity Framework Core**：作為 ORM 工具。
- **主數據庫選用 SQL Server**：存儲應用程序數據。

## 前端 (React)

### 1. 狀態管理
- **使用 Redux**：管理應用狀態。
- **使用 Local State**：管理組件內部狀態。

### 2. 路由
- **使用 React Router**：處理前端路由。

### 3. UI 設計
- **使用 Bootstrap**：設計響應式網站 (RWD)。

### 4. API 調用
- **使用 Axios**：發送 HTTP 請求。

## 身份驗證流程

- **使用 JWT 進行身份驗證**：確保用戶的身份信息安全。
- **JWT 存儲在 HttpOnly cookie 中**：增加安全性，防止 XSS 攻擊。
- **刷新令牌機制**：延長會話時間，保持用戶的登錄狀態。

