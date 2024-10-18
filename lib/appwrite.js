import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite"

export const config = {
  endpoint: 'http://cloud.appwrite.io/v1',
  platform: 'com.lnconst.aora',
  projectId: '',
  databaseId: '',
  userCollectionId: '',
  videoCollectionId: '',
  storageId: '',
}

// Init your react-native SDK
const client = new Client()

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform)

const account = new Account(client)
const avatars = new Avatars(client)
const database = new Databases(client)

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )

    if (!newAccount) throw new Error

    const avatarUrl = avatars.getInitials(username)

    await signIn(email, password)

    const newUser = await database.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.id,
        email,
        username,
        avatar: avatarUrl
      }
    )

    return newUser
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password)

    return session
  } catch (error) {
    throw new Error(error)
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get()

    if (!currentAccount) return Error

    const currentUser = await database.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) return Error

    return currentUser.documents[0]
  } catch (error) {
    console.log(error)
  }
}