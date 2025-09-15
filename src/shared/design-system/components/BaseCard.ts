import { BaseComponent } from './BaseComponent';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: (event: Event) => void;
}

/**
 * Base Card Component
 * Extends BaseComponent with card-specific functionality
 */
export class BaseCard extends BaseComponent {
  protected variant: CardProps['variant'] = 'default';
  protected size: CardProps['size'] = 'md';
  protected padding: CardProps['padding'] = 'md';
  protected clickable: boolean = false;
  protected onClick?: (event: Event) => void;

  // Card sections
  protected headerElement?: HTMLElement;
  protected contentElement?: HTMLElement;
  protected footerElement?: HTMLElement;

  constructor(element: HTMLElement, props: CardProps = {}) {
    super(element, props);
    this.variant = props.variant || 'default';
    this.size = props.size || 'md';
    this.padding = props.padding || 'md';
    this.clickable = props.clickable || false;
    this.onClick = props.onClick;
  }

  protected initialize(): void {
    this.element.classList.add('card', `card--${this.variant}`, `card--${this.size}`, `card--padding-${this.padding}`);
    
    if (this.clickable) {
      this.addClass('card--clickable');
    }
    
    this.createCardStructure();
    this.setupEventListeners();
  }

  protected render(): void {
    this.updateClasses();
  }

  private updateClasses(): void {
    // Remove all variant, size, and padding classes
    const classesToRemove = [
      'card--default', 'card--elevated', 'card--outlined', 'card--flat',
      'card--sm', 'card--md', 'card--lg',
      'card--padding-sm', 'card--padding-md', 'card--padding-lg',
      'card--clickable'
    ];
    
    classesToRemove.forEach(className => {
      this.removeClass(className);
    });
    
    // Add current classes
    this.addClass(`card--${this.variant}`);
    this.addClass(`card--${this.size}`);
    this.addClass(`card--padding-${this.padding}`);
    
    if (this.clickable) {
      this.addClass('card--clickable');
    }
  }

  private createCardStructure(): void {
    // Create header section
    this.headerElement = document.createElement('div');
    this.headerElement.classList.add('card__header');
    this.element.appendChild(this.headerElement);

    // Create content section
    this.contentElement = document.createElement('div');
    this.contentElement.classList.add('card__content');
    this.element.appendChild(this.contentElement);

    // Create footer section
    this.footerElement = document.createElement('div');
    this.footerElement.classList.add('card__footer');
    this.element.appendChild(this.footerElement);
  }

  private setupEventListeners(): void {
    if (this.clickable) {
      this.addEventListener('click', this.handleClick.bind(this));
      this.addEventListener('keydown', this.handleKeydown.bind(this));
      
      // Make card focusable
      this.setAttribute('tabindex', '0');
      this.setAttribute('role', 'button');
    }
  }

  private handleClick(event: Event): void {
    if (this.clickable) {
      this.onClick?.(event);
      this.emit('cardClick', { event, card: this });
    }
  }

  private handleKeydown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.clickable && (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ')) {
      event.preventDefault();
      this.onClick?.(event);
      this.emit('cardClick', { event, card: this });
    }
  }

  // Public methods for content management
  public setHeader(content: string | HTMLElement): void {
    if (!this.headerElement) return;
    
    this.headerElement.innerHTML = '';
    
    if (typeof content === 'string') {
      this.headerElement.innerHTML = content;
    } else {
      this.headerElement.appendChild(content);
    }
  }

  public setContent(content: string | HTMLElement): void {
    if (!this.contentElement) return;
    
    this.contentElement.innerHTML = '';
    
    if (typeof content === 'string') {
      this.contentElement.innerHTML = content;
    } else {
      this.contentElement.appendChild(content);
    }
  }

  public setFooter(content: string | HTMLElement): void {
    if (!this.footerElement) return;
    
    this.footerElement.innerHTML = '';
    
    if (typeof content === 'string') {
      this.footerElement.innerHTML = content;
    } else {
      this.footerElement.appendChild(content);
    }
  }

  public addToHeader(element: HTMLElement): void {
    if (!this.headerElement) return;
    this.headerElement.appendChild(element);
  }

  public addToContent(element: HTMLElement): void {
    if (!this.contentElement) return;
    this.contentElement.appendChild(element);
  }

  public addToFooter(element: HTMLElement): void {
    if (!this.footerElement) return;
    this.footerElement.appendChild(element);
  }

  // Public methods for state management
  public setVariant(variant: CardProps['variant']): void {
    this.variant = variant;
    this.render();
  }

  public setSize(size: CardProps['size']): void {
    this.size = size;
    this.render();
  }

  public setPadding(padding: CardProps['padding']): void {
    this.padding = padding;
    this.render();
  }

  public setClickable(clickable: boolean): void {
    this.clickable = clickable;
    this.render();
    
    if (clickable) {
      this.setAttribute('tabindex', '0');
      this.setAttribute('role', 'button');
    } else {
      this.removeAttribute('tabindex');
      this.removeAttribute('role');
    }
  }

  public setOnClick(handler: (event: Event) => void): void {
    this.onClick = handler;
  }

  // Getters for card sections
  public get header(): HTMLElement | undefined {
    return this.headerElement;
  }

  public get content(): HTMLElement | undefined {
    return this.contentElement;
  }

  public get footer(): HTMLElement | undefined {
    return this.footerElement;
  }
}
