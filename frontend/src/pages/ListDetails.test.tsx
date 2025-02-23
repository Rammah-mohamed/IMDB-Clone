// ListDetails.test.tsx
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { GET_MOVIE_CAST, GET_MOVIE_CREW, GET_TV_CAST, GET_TV_CREW } from '../graphql/queries';
import { MockedProvider } from '@apollo/client/testing';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import ListDetails from './ListDetails';

const mockAxios = new MockAdapter(axios);

const mocks = [
  {
    request: {
      query: GET_MOVIE_CAST,
      variables: { id: 1 },
    },
    result: {
      data: {
        moviesCast: [
          {
            id: '101',
            name: 'John Doe',
            gender: 2,
            popularity: 8.5,
            known_for_department: 'Acting',
            profile_path: '/john_doe.jpg',
            character: 'Hero',
            order: 0,
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_MOVIE_CREW,
      variables: { id: 1 },
    },
    result: {
      data: {
        moviesCrew: [
          {
            id: '201',
            name: 'Jane Smith',
            job: 'Director',
            gender: 1,
            profile_path: '/jane_smith.jpg',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_TV_CAST,
      variables: { id: 1 },
    },
    result: {
      data: {
        tvCast: [
          {
            id: '301',
            name: 'Alice Johnson',
            gender: 1,
            popularity: 9.1,
            known_for_department: 'Acting',
            profile_path: '/alice_johnson.jpg',
            character: 'Detective',
            order: 1,
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_TV_CREW,
      variables: { id: 1 },
    },
    result: {
      data: {
        moviesCrew: [
          {
            id: '401',
            name: 'Bob Brown',
            job: 'Producer',
            gender: 2,
            profile_path: '/bob_brown.jpg',
          },
        ],
      },
    },
  },
  // Error mock
  {
    request: {
      query: GET_MOVIE_CAST,
      variables: { id: 999 }, // Simulate error for invalid ID
    },
    error: new Error('Failed to fetch movie cast'),
  },
  // Loading state mock
  {
    request: {
      query: GET_TV_CREW,
      variables: { id: 2 },
    },
    result: {
      data: null, // Simulate loading state
    },
    delay: 1000, // Artificial delay to mimic network latency
  },
];

const mockState = {
  user: {
    id: 'user123',
    name: 'John Doe',
    email: 'johndoe@example.com',
    watchlist: ['movie1', 'movie2', 'movie3'],
  },
  title: 'Your Watchlist',
  data: {
    movies: [
      {
        id: 1,
        title: 'Inception',
        description: 'A mind-bending thriller',
        posterUrl: 'https://image.tmdb.org/t/p/w500/inception.jpg',
        year: 2010,
        isAdded: false,
      },
      {
        id: 2,
        title: 'The Dark Knight',
        description: 'A Batman film directed by Christopher Nolan',
        posterUrl: 'https://image.tmdb.org/t/p/w500/darkknight.jpg',
        year: 2008,
        isAdded: true,
      },
      {
        id: 3,
        title: 'Interstellar',
        description: 'A science fiction film about space exploration',
        posterUrl: 'https://image.tmdb.org/t/p/w500/interstellar.jpg',
        year: 2014,
      },
    ],
  },
  edit: true,
};

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

// Create a wrapper to mock the AuthContext provider and Router
const renderListDetails = () =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthContext.Provider value={{ user: mockState.user.name, login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter initialEntries={[{ pathname: '/ListDetails', state: mockState.data.movies }]}>
          <ListDetails />
        </MemoryRouter>
      </AuthContext.Provider>
    </MockedProvider>
  );

describe('ListDetails', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    mockAxios.reset();
    vi.spyOn(console, 'error');
  });

  afterAll(() => {
    cleanup();
  });

  it('should render the ListDetails component', async () => {
    renderListDetails();

    await waitFor(() => expect(screen.getByText(mockState.title)).toBeInTheDocument());
  });

  it('should change the view when clicking on view buttons', async () => {
    renderListDetails();

    await waitFor(() => {
      const detailsButton = screen.getAllByTestId('details');
      const gridButton = screen.getAllByTestId('grid');
      const compactButton = screen.getAllByTestId('compact');

      // Simulate clicking the view buttons
      fireEvent.click(detailsButton[0]);
      expect(screen.getAllByTestId('details')[0]).toHaveClass('detailsView');
      fireEvent.click(gridButton[0]);
      expect(screen.getAllByTestId('grid')[0]).toHaveClass('gridView');
      fireEvent.click(compactButton[0]);
      expect(screen.getAllByTestId('compact')[0]).toHaveClass('compactView');
    });
  });

  it('should add a movie to/from the watchlist', async () => {
    mockAxios
      .onPut(`http://localhost:3000/lists/Your_Watchlist/${mockState.data.movies[0].id}`)
      .reply(200, 'Movie updated.');

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider
          value={{ user: mockState.user.name, login: vi.fn(), logout: vi.fn() }}
        >
          <MemoryRouter
            initialEntries={[{ pathname: '/ListDetails', state: { data: mockState.data.movies } }]}
          >
            <ListDetails />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => {
      const addButton = screen.getAllByTestId('watchlist');
      fireEvent.click(addButton[0]);
    });

    await waitFor(() => expect(mockAxios.history.put.length).toBeGreaterThan(0));
  });

  it('should remove a movie to/from the watchlist', async () => {
    mockAxios
      .onDelete(`http://localhost:3000/lists/Your_Watchlist/${mockState.data.movies[1].id}`)
      .reply(200, 'Movie deleted successfully.');

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider
          value={{ user: mockState.user.name, login: vi.fn(), logout: vi.fn() }}
        >
          <MemoryRouter
            initialEntries={[{ pathname: '/ListDetails', state: { data: mockState.data.movies } }]}
          >
            <ListDetails />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => {
      const addButton = screen.getAllByTestId('watchlist');
      fireEvent.click(addButton[1]);
    });

    await waitFor(() => expect(mockAxios.history.delete.length).toBeGreaterThan(0));
  });

  it('should fetch user movies if the user is authenticated', async () => {
    mockAxios.onGet(`http://localhost:3000/lists/Your_Watchlist`).reply(200, mockState.data);

    renderListDetails();

    await waitFor(() => {
      expect(mockAxios.history.get.length).toBeGreaterThan(0);
    });
  });

  it('should navigates to mediaDetail when media gets clicked', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider
          value={{ user: mockState.user.name, login: vi.fn(), logout: vi.fn() }}
        >
          <MemoryRouter
            initialEntries={[{ pathname: '/ListDetails', state: { data: mockState.data.movies } }]}
          >
            <ListDetails />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => {
      const mediaName = screen.getAllByTestId('mediaName');
      fireEvent.click(mediaName[1]);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/mediaDetail',
        expect.objectContaining({ state: expect.any(Object) })
      );
    });
  });

  it('should navigates to createList when create button gets clicked', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider
          value={{ user: mockState.user.name, login: vi.fn(), logout: vi.fn() }}
        >
          <MemoryRouter
            initialEntries={[{ pathname: '/ListDetails', state: { data: mockState.data.movies } }]}
          >
            <ListDetails />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => {
      const createBtn = screen.getByTestId('create');
      fireEvent.click(createBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/createList');
    });
  });

  it('should be checked after change the checked value', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider
          value={{ user: mockState.user.name, login: vi.fn(), logout: vi.fn() }}
        >
          <MemoryRouter
            initialEntries={[
              {
                pathname: '/ListDetails',
                state: { data: mockState.data.movies, edit: mockState.edit },
              },
            ]}
          >
            <ListDetails />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => {
      const checkbox = screen.getAllByTestId('checkbox');
      expect(checkbox[1]).not.toBeChecked();

      fireEvent.change(checkbox[1], { target: { checked: true } });
      expect(checkbox[1]).toBeChecked();

      fireEvent.change(checkbox[1], { target: { checked: false } });
      expect(checkbox[1]).not.toBeChecked();
    });
  });

  it("should check all inputs when 'check all' button is clicked", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider
          value={{ user: mockState.user.name, login: vi.fn(), logout: vi.fn() }}
        >
          <MemoryRouter
            initialEntries={[
              {
                pathname: '/ListDetails',
                state: { data: mockState.data.movies, edit: mockState.edit },
              },
            ]}
          >
            <ListDetails />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('checkAll')).toHaveLength(1);
      expect(screen.getAllByTestId('checkbox')).toHaveLength(3);
    });

    const checkAll = screen.getByTestId('checkAll');
    const checkboxes = screen.getAllByTestId('checkbox');

    expect(checkAll).not.toBeChecked();
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();

    fireEvent.click(checkAll);

    await waitFor(() => {
      expect(checkAll).toBeChecked();
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });

    fireEvent.click(checkAll);

    await waitFor(() => {
      expect(checkAll).not.toBeChecked();
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });
  });

  it('should handle error when adding duplicate media to the list', async () => {
    mockAxios
      .onPut(`http://localhost:3000/lists/Your_Watchlist/${mockState.data.movies[0].id}`)
      .reply(500, 'Duplicate movie IDs are not allowed in the list.');

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider
          value={{ user: mockState.user.name, login: vi.fn(), logout: vi.fn() }}
        >
          <MemoryRouter
            initialEntries={[{ pathname: '/ListDetails', state: { data: mockState.data.movies } }]}
          >
            <ListDetails />
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => {
      const addButton = screen.getAllByTestId('watchlist');
      fireEvent.click(addButton[0]);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Duplicate movie IDs are not allowed in the list.'
      );
    });
  });
});
