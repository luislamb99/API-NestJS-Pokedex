import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreatePokemonDto } from "./dto/create-pokemon.dto";
import { UpdatePokemonDto } from "./dto/update-pokemon.dto";
import { isValidObjectId, Model } from "mongoose";
import { Pokemon } from "./entities/pokemon.entity";
import { InjectModel } from "@nestjs/mongoose";
import { PaginationDto } from "../common/dto/pagination.dto";
import * as process from "process";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PokemonService {
  private readonly CREATE = 'Create';
  private readonly UPDATE = 'Update';

  private readonly defaultLimit: number;
  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    // Inyección del módulo de variables de entorno
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.getOrThrow<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      return await this.pokemonModel.create(createPokemonDto);
    } catch (e) {
      this.handleExceptions(e, this.CREATE);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    // Si el term de búsqueda es un número entonces hace referencia al no del pokemon
    if ( ! isNaN( +term ) ) {
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    //  Mongo Id, si no existe un pokemon y si es un mongo ide valido
    if ( !pokemon && isValidObjectId( term ) ) {
      pokemon = await this.pokemonModel.findById( term );
    }

    // Name
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() } );
    }

    // Si no existe pokemon por el termino de búsqueda
    if(!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no "${ term }" not found`);
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );

    if ( updatePokemonDto.name )
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (e) {
      this.handleExceptions(e, this.UPDATE);
    }
  }

  async remove(id: string) {
    //const pokemon = await this.findOne( id );
    //await pokemon.deleteOne();
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${ id }" not found`);

    return ;
  }

  private handleExceptions ( e: any , operation: string) {
    if ( e.code === 11000) {
      throw new BadRequestException(`Pokemon exist in DB ${ JSON.stringify( e.keyValue ) }`);
    }
    console.log(e);
    throw new InternalServerErrorException(`Can ${operation} Pokemon - Check server logs`);
  }
}
