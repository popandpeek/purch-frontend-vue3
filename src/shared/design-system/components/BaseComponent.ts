/**
 * Base Component Class
 * Abstract base class for all UI components with common functionality
 */
export abstract class BaseComponent {
  protected element: HTMLElement;
  protected props: Record<string, any>;
  protected state: Record<string, any>;

  constructor(element: HTMLElement, props: Record<string, any> = {}) {
    this.element = element;
    this.props = { ...props };
    this.state = {};
    this.initialize();
  }

  /**
   * Initialize the component
   * Called in constructor - implement component-specific setup
   */
  protected abstract initialize(): void;

  /**
   * Render the component
   * Called when props or state change
   */
  protected abstract render(): void;

  /**
   * Update component props
   */
  public updateProps(newProps: Record<string, any>): void {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  /**
   * Update component state
   */
  public setState(newState: Record<string, any>): void {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  /**
   * Get current state
   */
  public getState(): Record<string, any> {
    return { ...this.state };
  }

  /**
   * Add CSS class to element
   */
  protected addClass(className: string): void {
    this.element.classList.add(className);
  }

  /**
   * Remove CSS class from element
   */
  protected removeClass(className: string): void {
    this.element.classList.remove(className);
  }

  /**
   * Toggle CSS class on element
   */
  protected toggleClass(className: string, condition?: boolean): void {
    if (condition !== undefined) {
      if (condition) {
        this.addClass(className);
      } else {
        this.removeClass(className);
      }
    } else {
      this.element.classList.toggle(className);
    }
  }

  /**
   * Set element attribute
   */
  protected setAttribute(name: string, value: string): void {
    this.element.setAttribute(name, value);
  }

  /**
   * Remove element attribute
   */
  protected removeAttribute(name: string): void {
    this.element.removeAttribute(name);
  }

  /**
   * Add event listener
   */
  protected addEventListener(event: string, handler: EventListener): void {
    this.element.addEventListener(event, handler);
  }

  /**
   * Remove event listener
   */
  protected removeEventListener(event: string, handler: EventListener): void {
    this.element.removeEventListener(event, handler);
  }

  /**
   * Emit custom event
   */
  protected emit(eventName: string, detail?: any): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    this.element.dispatchEvent(event);
  }

  /**
   * Show the component
   */
  public show(): void {
    this.element.style.display = '';
    this.emit('show');
  }

  /**
   * Hide the component
   */
  public hide(): void {
    this.element.style.display = 'none';
    this.emit('hide');
  }

  /**
   * Enable the component
   */
  public enable(): void {
    this.element.removeAttribute('disabled');
    this.removeClass('disabled');
    this.emit('enable');
  }

  /**
   * Disable the component
   */
  public disable(): void {
    this.element.setAttribute('disabled', 'true');
    this.addClass('disabled');
    this.emit('disable');
  }

  /**
   * Focus the component
   */
  public focus(): void {
    if (this.element.focus) {
      this.element.focus();
    }
  }

  /**
   * Blur the component
   */
  public blur(): void {
    if (this.element.blur) {
      this.element.blur();
    }
  }

  /**
   * Destroy the component
   */
  public destroy(): void {
    // Remove all event listeners
    const events = ['click', 'change', 'input', 'focus', 'blur'];
    events.forEach(event => {
      this.element.removeEventListener(event, this.handleEvent.bind(this));
    });

    // Remove from DOM
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.emit('destroy');
  }

  /**
   * Generic event handler
   */
  private handleEvent(_event: Event): void {
    // Override in subclasses for specific event handling
  }
}
