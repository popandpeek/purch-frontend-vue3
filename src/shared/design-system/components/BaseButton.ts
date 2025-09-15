import { BaseComponent } from './BaseComponent';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  children?: string;
  onClick?: (event: Event) => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
}

/**
 * Base Button Component
 * Extends BaseComponent with button-specific functionality
 */
export class BaseButton extends BaseComponent {
  protected variant: ButtonProps['variant'] = 'primary';
  protected size: ButtonProps['size'] = 'md';
  protected disabled: boolean = false;
  protected loading: boolean = false;
  protected icon?: string;
  protected children?: string;
  protected onClick?: (event: Event) => void;
  protected type: ButtonProps['type'] = 'button';
  protected href?: string;
  protected target?: string;

  constructor(element: HTMLElement, props: ButtonProps = {}) {
    super(element, props);
    this.variant = props.variant || 'primary';
    this.size = props.size || 'md';
    this.disabled = props.disabled || false;
    this.loading = props.loading || false;
    this.icon = props.icon;
    this.children = props.children;
    this.onClick = props.onClick;
    this.type = props.type || 'button';
    this.href = props.href;
    this.target = props.target;
  }

  protected initialize(): void {
    this.element.classList.add('btn', `btn--${this.variant}`, `btn--${this.size}`);
    
    // Set button type or convert to link
    if (this.href) {
      this.convertToLink();
    } else {
      this.setAttribute('type', this.type || 'button');
    }
    
    this.setupEventListeners();
    this.render();
  }

  protected render(): void {
    this.updateClasses();
    this.updateContent();
    this.updateState();
  }

  private updateClasses(): void {
    // Remove all variant and size classes
    const classesToRemove = [
      'btn--primary', 'btn--secondary', 'btn--tertiary', 'btn--danger', 'btn--success', 'btn--ghost',
      'btn--xs', 'btn--sm', 'btn--md', 'btn--lg', 'btn--xl',
      'btn--loading', 'btn--disabled'
    ];
    
    classesToRemove.forEach(className => {
      this.removeClass(className);
    });
    
    // Add current classes
    this.addClass(`btn--${this.variant}`);
    this.addClass(`btn--${this.size}`);
    
    if (this.loading) {
      this.addClass('btn--loading');
    }
    
    if (this.disabled) {
      this.addClass('btn--disabled');
    }
  }

  private updateContent(): void {
    let content = '';
    
    if (this.loading) {
      content = '<span class="btn__spinner"></span>Loading...';
    } else {
      if (this.icon) {
        content = `<span class="btn__icon">${this.icon}</span>`;
      }
      
      if (this.children) {
        content += `<span class="btn__text">${this.children}</span>`;
      }
    }
    
    this.element.innerHTML = content;
  }

  private updateState(): void {
    if (this.disabled || this.loading) {
      this.disable();
    } else {
      this.enable();
    }
  }

  private setupEventListeners(): void {
    this.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.onClick?.(event);
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private convertToLink(): void {
    // Convert button to link if href is provided
    const link = document.createElement('a');
    link.href = this.href!;
    if (this.target) {
      link.target = this.target;
    }
    
    // Copy all attributes and classes
    Array.from(this.element.attributes).forEach(attr => {
      if (attr.name !== 'type') {
        link.setAttribute(attr.name, attr.value);
      }
    });
    
    // Replace element
    this.element.parentNode?.replaceChild(link, this.element);
    this.element = link;
  }

  // Public methods for state management
  public setLoading(loading: boolean): void {
    this.loading = loading;
    this.render();
  }

  public setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.render();
  }

  public setVariant(variant: ButtonProps['variant']): void {
    this.variant = variant;
    this.render();
  }

  public setSize(size: ButtonProps['size']): void {
    this.size = size;
    this.render();
  }

  public setText(text: string): void {
    this.children = text;
    this.render();
  }

  public setIcon(icon: string): void {
    this.icon = icon;
    this.render();
  }

  public setOnClick(handler: (event: Event) => void): void {
    this.onClick = handler;
  }
}
