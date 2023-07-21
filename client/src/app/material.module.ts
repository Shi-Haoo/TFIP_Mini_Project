
import { NgModule } from "@angular/core";

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MatSortModule } from "@angular/material/sort";
import { MatPaginatorModule} from '@angular/material/paginator'
import { MatTableModule } from "@angular/material/table";
import { MatDialogModule } from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatBadgeModule} from '@angular/material/badge';
import {MatRadioModule} from '@angular/material/radio';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';



const matModules: any[] = [MatToolbarModule, MatFormFieldModule, MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatSortModule, MatPaginatorModule, MatTableModule, MatDialogModule, MatDividerModule, MatSidenavModule, MatListModule, MatBadgeModule, MatRadioModule, MatProgressSpinnerModule]
 @NgModule({
     imports: matModules,
     exports: matModules
   })
   
export class MaterialModule { }