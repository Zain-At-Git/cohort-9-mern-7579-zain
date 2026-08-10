import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('redirects to login if no token exists', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Dashboard Page</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });

    it('renders children if token exists', () => {
        localStorage.setItem('token', 'fake-token');

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Dashboard Page</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/dashboard page/i)).toBeInTheDocument();
    });
});