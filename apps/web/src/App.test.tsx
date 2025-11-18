import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /literate octo chainsaw/i })).toBeInTheDocument();
  });

  it('renders initial count', () => {
    render(<App />);
    expect(screen.getByRole('button')).toHaveTextContent('Count is 0');
  });

  it('increments count when button is clicked', () => {
    render(<App />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveTextContent('Count is 1');
  });
});
