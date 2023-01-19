import {gql, createClient, Client} from '@urql/core'
import {Address} from '@unique-nft/utils/address'
import type {CrossAccountIdOrString} from "@unique-nft/utils";

const getCollections = async (client: Client, address: CrossAccountIdOrString) => {
  const collectionsQuery = gql`
    query MyCollections($ownerNormalized: String) {
      collections(
        where: {
          _or: [
            {owner_normalized: {_eq: $ownerNormalized}},
            {tokens: {owner_normalized: {_eq: $ownerNormalized}}},
          ]
        },
        order_by: {collection_id: asc}
        offset: 0
        limit: 10
      ) {
        count
        timestamp
        data {
          collection_id
          type
          token_prefix
          nam 
          collection_cover
          description
        }
      }
    }
  `;

  const normalizedAddress = Address.extract.substrateOrMirrorIfEthereumNormalized(address)

  const result = await client.query(
    collectionsQuery,
    {
      $ownerNormalized: normalizedAddress
    }).toPromise()

  return result.data.collections
}


const getTokens = async(client: Client, address: CrossAccountIdOrString) => {
  const tokensQuery = gql`
    query MyTokens($ownerNormalized: String) {
      tokens(
        where: {
          owner_normalized: {_eq: $ownerNormalized},
          # collection_id: {_in: [123]}
        },
        order_by: {collection_id: desc, token_id: asc}
        offset: 0
        limit: 10
      ) {
        count
        timestamp
        data {
          collection_id
          token_id
          token_name
          image
          owner_normalized
          date_of_creation
        }
      }
    }
  `

  const normalizedAddress = Address.extract.addressForScanNormalized(address)
  console.log(normalizedAddress)

  const result = await client.query(
    tokensQuery,
    {
      $ownerNormalized: normalizedAddress
    }).toPromise()

  return result
}

const client = createClient({
  url: 'https://api-quartz.uniquescan.io/v1/graphql',
});

(async () => {
console.dir(await getTokens(client, '0x1B7AAcb25894D792601BBE4Ed34E07Ed14Fd31eB'))
})()
