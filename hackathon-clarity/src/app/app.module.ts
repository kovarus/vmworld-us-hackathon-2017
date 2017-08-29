import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ClarityModule } from 'clarity-angular';
import { AppComponent } from './app.component';
import { HomeComponent } from "./home/home.component";
import { AboutComponent } from "./about/about.component";
import { PushMessageComponent } from './messages/push-message/push-message.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import {ToasterModule} from 'angular2-toaster';

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        HomeComponent,
        PushMessageComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ToasterModule,
        HttpModule,
        ClarityModule,
        ServiceWorkerModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
