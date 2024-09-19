import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private apiUrl = "";

  constructor(private http: HttpClient) {}

  getMemoryUsage(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

}
