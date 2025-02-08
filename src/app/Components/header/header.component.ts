import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'], 
})
export class HeaderComponent {
  isLanguageDropdownOpen = false;
  iconPairs = [
        { old: 'fa-angle-left', new: 'fa-angle-right' },
        { old: 'fa-chevron-left', new: 'fa-chevron-right' } ];
  //currentIconDirection = 'right'; // Default to right-facing icon
  currentLang: string | undefined;

  constructor(private translate: TranslateService) {
    this.currentLang= localStorage.getItem('lang') || 'ar';

  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    //this.updateIcons();
    this.setLanguageDirection(lang);
    this.isLanguageDropdownOpen = false;
    //this.iconSwitcherService.switchIcons(lang, this.iconPairs);

  }

  setLanguageDirection(lang: string) {
    const htmlElement = document.documentElement;
    if (lang === 'ar') {
      htmlElement.dir = 'rtl';
      htmlElement.lang = 'ar';
      localStorage.setItem('lang', 'ar');


    } else {
      htmlElement.dir = 'ltr';
      htmlElement.lang = lang;
      localStorage.setItem('lang', lang);

    }
  }

  // updateIconDirection(lang: string) {
  //   this.currentIconDirection = lang === 'ar' ? 'left' : 'right';
  // }
  // updateIcons() {
  //   console.log("44")
  //   const iconPairs = [
  //     { old: 'fa-angle-left', new: 'fa-angle-left' },
  //     { old: 'fa-chevron-left', new: 'fa-chevron-left' },
  //     { old: 'fa-angle-left', new: 'fa-angle-left' },
  //     { old: 'fa-chevron-left', new: 'fa-chevron-left' },
  //   ];
  //   let i=-1
  //   iconPairs.forEach(pair => {
  //     const elements = document.querySelectorAll(`.${pair.old}`);
  //     i=i+1
  //     console.log(elements)
  //     if (i < 2) {
  //       console.log("befor")

  //     elements.forEach((element: Element) => {
        
  //       element.classList.remove(pair.old);
  //       console.log(this.currentLang)

  //       element.classList.add( pair.new );
        
        

  //     });
  //   }
      // const elements2 = document.querySelectorAll(`.${pair.new}`);

      // console.log("after")
      // console.log(elements2)
   // });
  //}
 
}