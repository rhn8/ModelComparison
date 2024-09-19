import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = "";

  constructor(private http: HttpClient) { }

  getMessage(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
}
