import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import API from '../api/axios';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

jest.mock('../api/axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockNotes = [
    { id: 1, title: 'First Note', content: '<p>Hello world</p>', is_pinned: false, updated_at: '2026-08-01T10:00:00Z' },
    { id: 2, title: 'Second Note', content: '<p>Another note here</p>', is_pinned: false, updated_at: '2026-08-02T10:00:00Z' },
];

const renderDashboard = () => {
    render(
        <BrowserRouter>
            <Dashboard />
        </BrowserRouter>
    );
};

describe('Dashboard Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
    });

    it('shows loading spinner initially', () => {
        API.get.mockReturnValue(new Promise(() => { })); // never resolves
        renderDashboard();
        expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    it('renders notes after successful fetch', async () => {
        API.get.mockResolvedValueOnce({ data: { notes: mockNotes } });
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('First Note')).toBeInTheDocument();
            expect(screen.getByText('Second Note')).toBeInTheDocument();
        });
    });

    it('shows empty state when there are no notes', async () => {
        API.get.mockResolvedValueOnce({ data: { notes: [] } });
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
        });
    });

    it('filters notes based on search input', async () => {
        API.get.mockResolvedValueOnce({ data: { notes: mockNotes } });
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('First Note')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/search your notes/i);
        fireEvent.change(searchInput, { target: { value: 'Second' } });

        expect(screen.queryByText('First Note')).not.toBeInTheDocument();
        expect(screen.getByText('Second Note')).toBeInTheDocument();
    });

    it('deletes a note when delete is confirmed', async () => {
        API.get.mockResolvedValueOnce({ data: { notes: mockNotes } });
        API.delete.mockResolvedValueOnce({ data: { success: true } });

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('First Note')).toBeInTheDocument();
        });


        const firstNoteCard = screen.getByText('First Note').closest('.note-tile');
        const deleteButton = within(firstNoteCard).getByTitle(/delete note/i);
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(API.delete).toHaveBeenCalledWith('/notes/1');
        });
    });

    it('toggles pin status when pin button is clicked', async () => {
        API.get.mockResolvedValueOnce({ data: { notes: mockNotes } });
        API.patch.mockResolvedValueOnce({ data: { isPinned: true, message: 'Note pinned' } });

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('First Note')).toBeInTheDocument();
        });

        const firstNoteCard = screen.getByText('First Note').closest('.note-tile');
        const pinButton = within(firstNoteCard).getByTitle(/pin note/i);
        fireEvent.click(pinButton);

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalledWith('/notes/1/pin');
        });
    });
});
