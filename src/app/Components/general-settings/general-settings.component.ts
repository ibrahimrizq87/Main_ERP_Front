import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css'
})
export class GeneralSettingsComponent {

  currentLang: string | undefined;
  constructor(private translate: TranslateService) {
    this.currentLang= localStorage.getItem('lang') || 'ar';

  }
  isLanguageDropdownOpen = false;
  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang' ,lang );
    //this.updateIcons();
    // this.setLanguageDirection(lang);
    this.isLanguageDropdownOpen = false;
    //this.iconSwitcherService.switchIcons(lang, this.iconPairs);

  }
  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

}
