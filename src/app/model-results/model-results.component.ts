import { Component } from '@angular/core';
import { cpuAverage } from 'tfjsBodyseg';
@Component({
  selector: 'app-model-results',
  standalone: true,
  imports: [],
  templateUrl: './model-results.component.html',
  styleUrl: './model-results.component.css'
})

export class ModelResultsComponent {

  model = ""
  inference = 0
  Memory= 0

  public update(model, inf, Memory){
    this.model = model
    this.inference = inf
    this.Memory = Memory
    
  }




  

}
