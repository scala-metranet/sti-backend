import { ModelCity } from "@/models/city.model";
import { ModelProvince } from "@/models/province.model";

class LocationService {
  public async findProvince(): Promise<any[]> {
    const data:any[] = await ModelProvince.query().select().from(ModelProvince.tableName);
    return data;
  }

  public async findCity(province_id): Promise<any[]> {
    let ModelQuery:any = ModelCity.query().select()
    
    if(province_id != 0){
      ModelQuery = ModelQuery.where('province_id',province_id)
    }

    const data:any[] = await ModelQuery
    .from(ModelCity.tableName);
    return data;
  }
}

export default LocationService;
