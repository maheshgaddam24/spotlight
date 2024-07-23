import { Component, ElementRef, Input, AfterViewInit } from '@angular/core';
import Prism from 'prismjs';

@Component({
  selector: 'app-prism, [prism]',
  template: '<ng-content></ng-content>',
  styles: [`
    :host.dark { 
      background: #333; 
      color: #FFF;
      }`
  ]
})

export class PrismComponent implements AfterViewInit {
  @Input() code: string;
  @Input() language = 'sql';
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const code = (this.code || this.el.nativeElement.innerText);
    const grammar = Prism.languages[this.language];
    const html = Prism.highlight(code, grammar, this.language);
    this.el.nativeElement.innerHTML = html;
  }
}
