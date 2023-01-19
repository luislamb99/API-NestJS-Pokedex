import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { Pokemon, PokemonSchema } from "./entities/pokemon.entity";
import { ConfigModule } from "@nestjs/config";

@Module({
  controllers: [PokemonController],
  providers: [PokemonService],
  imports: [
    ConfigModule, // Importación del módulo de variables de entorno
    MongooseModule.forFeature([
      {
        name: Pokemon.name,
        schema: PokemonSchema,
      }
    ]),
  ],
  exports: [
    MongooseModule, // Exportación del módulo d que contiene el schema de mongoose
  ]
})
export class PokemonModule {}
