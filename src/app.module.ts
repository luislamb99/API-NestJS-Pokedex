import { Module } from '@nestjs/common';
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from 'path';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from "@nestjs/mongoose";
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from "@nestjs/config";
import { EnvConfiguration } from "./config/env.config";
import { JoiValidationSchema } from "./config/joi.validation";

@Module({
  imports: [
    // debe ir primero para cargar las variables de entorno
    // Configuración de la función de las variables de entorno env.config.ts
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema, // Importar el schema de validación creado con JOI
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    MongooseModule.forRoot(process.env.MONGODB),
    PokemonModule,
    CommonModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
