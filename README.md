
# Aulala-Audio Story Platform

[Aulala](https://aulala-a8757.web.app/)  是一個有聲故事平台，提供使用者探索和創作有聲故事的創作空間。
使用者可以瀏覽和搜尋有興趣的故事或劇本，參與社群互動，並創作屬於自己的配音作品。本平台提供互動性的音訊播放，結合波形視覺化和同步顯示的文字稿，提升使用者的沉浸體驗。

> [!NOTE]
> 歡迎使用遊客帳號登入試用

## Features

#### 配音創作
- 上傳自己的錄音檔為劇本配音。
- 系統會向 OpenAI STT API 發送請求，將語音轉錄為文字並存入資料庫

#### 瀏覽故事/劇本
- 瀏覽和搜尋各類有興趣的故事和劇本
- 根據時間篩選
- 通過帳號名稱、故事標題、標籤、故事摘要進行模糊搜尋

#### 社群互動
- 點讚、收藏故事/劇本
- 留言與其他使用者互動

#### 聆聽有聲故事
- 播放有聲故事，同步顯示文字稿
- 顯示音訊波形視覺化播放進度

## 相關技術
#### 前端
- React + TypeScript + Tailwind
- Next UI：提供簡潔、美觀的 UI 元件庫
- Wavesurfer.js：實現音檔波形視覺化功能
- React Query：管理資料的存取和快取
- UseForm：處理表單輸入和驗證

#### 後端與其他服務
- Cloud Functions：雲端執行後端邏輯，處理音檔轉錄文字稿功能
- OpenAI STT 時間標記處理：使用 `OpenAI API` 處理音訊轉文字並生成對應的時間標記
- Algolia：實現模糊搜尋功能
- Firebase Auth：連結 Google Account 第三方登入認證，簡化使用者註冊流程
- Firebase：雲端非關聯式資料庫
