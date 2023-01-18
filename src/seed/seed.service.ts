import { Injectable } from '@nestjs/common';
import { PokeResponse } from "./interfaces/poke-response.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Pokemon } from "../pokemon/entities/pokemon.entity";
import { Model } from "mongoose";
import { AxiosAdapter } from "../common/httpAdapters/axios.adapter";


@Injectable()
export class SeedService {

  // private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {
  }

  async executeSeed() {

    const data = await this.http.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=650`);

    const pokemonToInsert: { name: string; no: number} [] = [];

    data.results.forEach(({name, url}) => {
      const segments = url.split('/');
      const no: number = +segments[ segments.length - 2];

      pokemonToInsert.push({ name, no});

      //const pokemon = this.pokemonModel.create({name, no});
    });

    await this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed Executed';
  }
}
