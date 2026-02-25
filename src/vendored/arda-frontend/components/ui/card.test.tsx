import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card';

describe('Card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Card with children', () => {
    render(<Card>Card body</Card>);
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('Card has data-slot="card"', () => {
    const { container } = render(<Card />);
    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
  });

  it('Card merges className', () => {
    const { container } = render(<Card className="custom-class" />);
    expect(container.querySelector('[data-slot="card"]')).toHaveClass('custom-class');
  });

  it('Card forwards additional props', () => {
    const { container } = render(<Card data-testid="my-card" />);
    expect(container.querySelector('[data-testid="my-card"]')).toBeInTheDocument();
  });

  it('renders CardHeader with children', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('CardHeader has data-slot="card-header"', () => {
    const { container } = render(<CardHeader />);
    expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
  });

  it('CardHeader merges className', () => {
    const { container } = render(<CardHeader className="header-class" />);
    expect(container.querySelector('[data-slot="card-header"]')).toHaveClass('header-class');
  });

  it('renders CardTitle with children', () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('CardTitle has data-slot="card-title"', () => {
    const { container } = render(<CardTitle />);
    expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument();
  });

  it('CardTitle merges className', () => {
    const { container } = render(<CardTitle className="title-class" />);
    expect(container.querySelector('[data-slot="card-title"]')).toHaveClass('title-class');
  });

  it('renders CardDescription with children', () => {
    render(<CardDescription>A description</CardDescription>);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('CardDescription has data-slot="card-description"', () => {
    const { container } = render(<CardDescription />);
    expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument();
  });

  it('CardDescription merges className', () => {
    const { container } = render(<CardDescription className="desc-class" />);
    expect(container.querySelector('[data-slot="card-description"]')).toHaveClass('desc-class');
  });

  it('renders CardAction with children', () => {
    render(<CardAction>Action</CardAction>);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('CardAction has data-slot="card-action"', () => {
    const { container } = render(<CardAction />);
    expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument();
  });

  it('CardAction merges className', () => {
    const { container } = render(<CardAction className="action-class" />);
    expect(container.querySelector('[data-slot="card-action"]')).toHaveClass('action-class');
  });

  it('renders CardContent with children', () => {
    render(<CardContent>Content here</CardContent>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('CardContent has data-slot="card-content"', () => {
    const { container } = render(<CardContent />);
    expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
  });

  it('CardContent merges className', () => {
    const { container } = render(<CardContent className="content-class" />);
    expect(container.querySelector('[data-slot="card-content"]')).toHaveClass('content-class');
  });

  it('renders CardFooter with children', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('CardFooter has data-slot="card-footer"', () => {
    const { container } = render(<CardFooter />);
    expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument();
  });

  it('CardFooter merges className', () => {
    const { container } = render(<CardFooter className="footer-class" />);
    expect(container.querySelector('[data-slot="card-footer"]')).toHaveClass('footer-class');
  });

  it('renders full card composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
          <CardAction>Act</CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText('Act')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Foot')).toBeInTheDocument();
  });
});
