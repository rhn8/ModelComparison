// import { NgModule } from "@angular/core"
// import { BrowserModule } from "@angular/platform-browser"

import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { provideHttpClient } from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";

// import { AppComponent} from "./app.component"

// @NgModule({
//     declarations:[
//         AppComponent
//     ],
//     imports: [
//         BrowserModule
//     ],
//     providers: [],
//     bootstrap: [AppComponent]
// })

// export class Appmodule {}
@NgModule({
    imports: [
      // Remove the module 
    ],
    declarations: [
      
   ],
   providers: [provideHttpClient()] ,// add it here
   bootstrap: []
  })
  export class AppModule {} 