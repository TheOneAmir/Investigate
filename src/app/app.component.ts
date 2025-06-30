import { Component } from '@angular/core';
import OpenAI from "openai";



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-first-project';
  shoppingList: any = [];
  private openai = new OpenAI({ apiKey: 'My API Key' });
  
  public addToCart(value: any) {

    this.shoppingList.push(value);

    const response = this.openai.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      prompt: "You are an assistant that provides information about " + value
    });
  }
}


