import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  population?: number;
  capital?: string;
  region?: string;
  currency?: string;
  timezone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCountryData {
  name: string;
  code: string;
  flag: string;
  population?: number;
  capital?: string;
  region?: string;
  currency?: string;
  timezone?: string;
}

export interface UpdateCountryData {
  name?: string;
  code?: string;
  flag?: string;
  population?: number;
  capital?: string;
  region?: string;
  currency?: string;
  timezone?: string;
  isActive?: boolean;
}

class CountryService {
  private collectionName = 'countries';

  async getCountries(): Promise<Country[]> {
    try {
      const countriesRef = collection(db, this.collectionName);
      const q = query(countriesRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          code: data.code,
          flag: data.flag,
          population: data.population,
          capital: data.capital,
          region: data.region,
          currency: data.currency,
          timezone: data.timezone,
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Country;
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw new Error('Failed to fetch countries');
    }
  }

  async getCountry(id: string): Promise<Country | null> {
    try {
      const countryRef = doc(db, this.collectionName, id);
      const countrySnap = await getDoc(countryRef);
      
      if (countrySnap.exists()) {
        const data = countrySnap.data();
        return {
          id: countrySnap.id,
          name: data.name,
          code: data.code,
          flag: data.flag,
          population: data.population,
          capital: data.capital,
          region: data.region,
          currency: data.currency,
          timezone: data.timezone,
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Country;
      }
      return null;
    } catch (error) {
      console.error('Error fetching country:', error);
      throw new Error('Failed to fetch country');
    }
  }

  async createCountry(countryData: CreateCountryData): Promise<string> {
    try {
      // Check if country with same code already exists
      const existingCountries = await this.getCountries();
      const existingCountry = existingCountries.find(
        country => country.code.toLowerCase() === countryData.code.toLowerCase()
      );
      
      if (existingCountry) {
        throw new Error('Un pays avec ce code existe déjà');
      }

      // Clean the data to remove undefined values
      const cleanData: any = {
        name: countryData.name,
        code: countryData.code,
        flag: countryData.flag,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Only add optional fields if they have values
      if (countryData.population !== undefined && countryData.population !== null) {
        cleanData.population = countryData.population;
      }
      if (countryData.capital && countryData.capital.trim() !== '') {
        cleanData.capital = countryData.capital;
      }
      if (countryData.region && countryData.region.trim() !== '') {
        cleanData.region = countryData.region;
      }
      if (countryData.currency && countryData.currency.trim() !== '') {
        cleanData.currency = countryData.currency;
      }
      if (countryData.timezone && countryData.timezone.trim() !== '') {
        cleanData.timezone = countryData.timezone;
      }

      const countriesRef = collection(db, this.collectionName);
      const docRef = await addDoc(countriesRef, cleanData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating country:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create country');
    }
  }

  async updateCountry(id: string, countryData: UpdateCountryData): Promise<void> {
    try {
      const countryRef = doc(db, this.collectionName, id);
      
      // Check if country with same code already exists (excluding current country)
      if (countryData.code) {
        const existingCountries = await this.getCountries();
        const existingCountry = existingCountries.find(
          country => country.code.toLowerCase() === countryData.code!.toLowerCase() && country.id !== id
        );
        
        if (existingCountry) {
          throw new Error('Un pays avec ce code existe déjà');
        }
      }

      // Clean the data to remove undefined values
      const cleanData: any = {
        updatedAt: serverTimestamp()
      };

      // Only add fields that are defined
      if (countryData.name !== undefined) {
        cleanData.name = countryData.name;
      }
      if (countryData.code !== undefined) {
        cleanData.code = countryData.code;
      }
      if (countryData.flag !== undefined) {
        cleanData.flag = countryData.flag;
      }
      if (countryData.isActive !== undefined) {
        cleanData.isActive = countryData.isActive;
      }
      if (countryData.population !== undefined && countryData.population !== null) {
        cleanData.population = countryData.population;
      }
      if (countryData.capital !== undefined) {
        cleanData.capital = countryData.capital;
      }
      if (countryData.region !== undefined) {
        cleanData.region = countryData.region;
      }
      if (countryData.currency !== undefined) {
        cleanData.currency = countryData.currency;
      }
      if (countryData.timezone !== undefined) {
        cleanData.timezone = countryData.timezone;
      }

      await updateDoc(countryRef, cleanData);
    } catch (error) {
      console.error('Error updating country:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update country');
    }
  }

  async deleteCountry(id: string): Promise<void> {
    try {
      const countryRef = doc(db, this.collectionName, id);
      await deleteDoc(countryRef);
    } catch (error) {
      console.error('Error deleting country:', error);
      throw new Error('Failed to delete country');
    }
  }

  async getActiveCountries(): Promise<Country[]> {
    try {
      const countriesRef = collection(db, this.collectionName);
      const q = query(
        countriesRef, 
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          code: data.code,
          flag: data.flag,
          population: data.population,
          capital: data.capital,
          region: data.region,
          currency: data.currency,
          timezone: data.timezone,
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Country;
      });
    } catch (error) {
      console.error('Error fetching active countries:', error);
      throw new Error('Failed to fetch active countries');
    }
  }

  async getCountriesByRegion(region: string): Promise<Country[]> {
    try {
      const countriesRef = collection(db, this.collectionName);
      const q = query(
        countriesRef, 
        where('region', '==', region),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          code: data.code,
          flag: data.flag,
          population: data.population,
          capital: data.capital,
          region: data.region,
          currency: data.currency,
          timezone: data.timezone,
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Country;
      });
    } catch (error) {
      console.error('Error fetching countries by region:', error);
      throw new Error('Failed to fetch countries by region');
    }
  }

  async searchCountries(searchTerm: string): Promise<Country[]> {
    try {
      const countries = await this.getCountries();
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      
      return countries.filter(country => 
        country.name.toLowerCase().includes(lowercaseSearchTerm) ||
        country.code.toLowerCase().includes(lowercaseSearchTerm) ||
        country.capital?.toLowerCase().includes(lowercaseSearchTerm) ||
        country.region?.toLowerCase().includes(lowercaseSearchTerm)
      );
    } catch (error) {
      console.error('Error searching countries:', error);
      throw new Error('Failed to search countries');
    }
  }

  async toggleCountryStatus(id: string): Promise<void> {
    try {
      const country = await this.getCountry(id);
      if (!country) {
        throw new Error('Pays non trouvé');
      }

      await this.updateCountry(id, { isActive: !country.isActive });
    } catch (error) {
      console.error('Error toggling country status:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to toggle country status');
    }
  }

  async getCountryStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    regions: number;
  }> {
    try {
      const countries = await this.getCountries();
      const regions = new Set(countries.map(c => c.region).filter(Boolean));
      
      return {
        total: countries.length,
        active: countries.filter(c => c.isActive).length,
        inactive: countries.filter(c => !c.isActive).length,
        regions: regions.size
      };
    } catch (error) {
      console.error('Error fetching country stats:', error);
      throw new Error('Failed to fetch country stats');
    }
  }
}

export const countryService = new CountryService();
