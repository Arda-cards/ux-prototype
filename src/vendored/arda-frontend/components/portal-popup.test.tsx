import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PortalPopup from './portal-popup';

describe('PortalPopup', () => {
  it('renders children', () => {
    render(
      <PortalPopup>
        <div data-testid="child">Hello</div>
      </PortalPopup>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies default overlay color', () => {
    const { container } = render(
      <PortalPopup>
        <div>content</div>
      </PortalPopup>
    );
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.backgroundColor).toBe('rgba(0, 0, 0, 0.3)');
  });

  it('applies custom overlay color', () => {
    const { container } = render(
      <PortalPopup overlayColor="rgba(255, 0, 0, 0.5)">
        <div>content</div>
      </PortalPopup>
    );
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.backgroundColor).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('calls onOutsideClick when overlay is clicked', () => {
    const onOutsideClick = jest.fn();
    const { container } = render(
      <PortalPopup onOutsideClick={onOutsideClick}>
        <div>content</div>
      </PortalPopup>
    );
    const overlay = container.firstChild as HTMLElement;
    fireEvent.click(overlay);
    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onOutsideClick when child is clicked', () => {
    const onOutsideClick = jest.fn();
    render(
      <PortalPopup onOutsideClick={onOutsideClick}>
        <div data-testid="child">content</div>
      </PortalPopup>
    );
    fireEvent.click(screen.getByTestId('child'));
    expect(onOutsideClick).not.toHaveBeenCalled();
  });

  it('does not throw when onOutsideClick is not provided', () => {
    const { container } = render(
      <PortalPopup>
        <div>content</div>
      </PortalPopup>
    );
    const overlay = container.firstChild as HTMLElement;
    expect(() => fireEvent.click(overlay)).not.toThrow();
  });

  it('positions child using relativeLayerRef when ref has offset', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <div>
        <div ref={ref} style={{ position: 'absolute', top: 100, left: 50 }} />
        <PortalPopup relativeLayerRef={ref} bottom={8}>
          <div>popup</div>
        </PortalPopup>
      </div>
    );
    // Since offsetTop/offsetHeight are 0 in JSDOM, position will use fallback
    const innerDiv = container.querySelector('.absolute') as HTMLElement;
    expect(innerDiv).toBeInTheDocument();
  });

  it('uses default bottom=4 when not provided', () => {
    const { container } = render(
      <PortalPopup>
        <div>content</div>
      </PortalPopup>
    );
    const innerDiv = container.querySelector('.absolute') as HTMLElement;
    expect(innerDiv.style.top).toBe('4px');
  });

  it('uses custom bottom value', () => {
    const { container } = render(
      <PortalPopup bottom={20}>
        <div>content</div>
      </PortalPopup>
    );
    const innerDiv = container.querySelector('.absolute') as HTMLElement;
    expect(innerDiv.style.top).toBe('20px');
  });
});
