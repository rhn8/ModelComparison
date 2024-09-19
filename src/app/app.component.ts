import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { CommonModule } from '@angular/common';
import { ModelResultsComponent } from './model-results/model-results.component';
import { ImageInputComponent } from "./image-input/image-input.component";
import { MutlipleImageInputComponent } from './mutliple-image-input/mutliple-image-input.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, ModelResultsComponent, ImageInputComponent,MutlipleImageInputComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'ModelComparison';

  @ViewChild(ModelResultsComponent) resultsComponent: ModelResultsComponent;


  recieveData(data){
    this.resultsComponent.update(data[0],data[1],data[2])
  }
  
  
}

