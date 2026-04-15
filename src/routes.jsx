import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Study from './pages/Study';
import Quiz from './pages/Quiz';
import Party from './pages/Party';
import Activities from './pages/Activities';
import Chat from './pages/Chat';
import Message from './pages/Message';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Showcase from './pages/Showcase';

// 路由配置
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="study" element={<Study />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/:type" element={<Quiz />} />
          <Route path="party" element={<Party />} />
          <Route path="activities" element={<Activities />} />
          <Route path="activities/:id" element={<Activities />} />
          <Route path="chat" element={<Chat />} />
          <Route path="message" element={<Message />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
          <Route path="showcase" element={<Showcase />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;