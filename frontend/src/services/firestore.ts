import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { logger } from '../utils/logger'
import { Agent } from '../types/agent'

export const fetchAgentsFromFirestore = async (filters?: any): Promise<{ agents: Agent[] }> => {
  try {
    logger.debug('Fetching agents from Firestore', filters, 'Firestore')
    
    let agentsQuery = collection(db, 'agents')
    
    // Apply filters if provided
    if (filters?.visibility) {
      agentsQuery = query(agentsQuery, where('visibility', '==', filters.visibility))
    }
    if (filters?.provider) {
      agentsQuery = query(agentsQuery, where('provider', '==', filters.provider))
    }
    if (filters?.category) {
      agentsQuery = query(agentsQuery, where('metadata.category', '==', filters.category))
    }
    
    const snapshot = await getDocs(agentsQuery)
    const agents: Agent[] = []
    
    snapshot.forEach(doc => {
      const data = doc.data()
      const agent: Agent = {
        id: doc.id,
        name: data.name,
        description: data.description,
        provider: data.provider,
        route: data.route,
        metadata: {
          tags: data.metadata?.tags || [],
          category: data.metadata?.category || 'General'
        },
        visibility: data.visibility,
        allowedRoles: data.allowedRoles || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }
      agents.push(agent)
    })
    
    logger.info(`Fetched ${agents.length} agents from Firestore`, { agentNames: agents.map(a => a.name) }, 'Firestore')
    return { agents }
    
  } catch (error) {
    logger.error('Error fetching agents from Firestore', error, 'Firestore')
    throw error
  }
}

export const fetchAgentFromFirestore = async (id: string): Promise<Agent | null> => {
  try {
    logger.debug(`Fetching agent ${id} from Firestore`, { id }, 'Firestore')
    
    const docRef = doc(db, 'agents', id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      console.log(`❌ Agent ${id} not found in Firestore`)
      return null
    }
    
    const data = docSnap.data()
    const agent: Agent = {
      id: docSnap.id,
      name: data.name,
      description: data.description,
      provider: data.provider,
      route: data.route,
      metadata: {
        tags: data.metadata?.tags || [],
        category: data.metadata?.category || 'General'
      },
      visibility: data.visibility,
      allowedRoles: data.allowedRoles || [],
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }
    
    console.log(`✅ Fetched agent from Firestore:`, agent.name)
    return agent
    
  } catch (error) {
    console.error(`❌ Error fetching agent ${id} from Firestore:`, error)
    throw error
  }
}

export const fetchCategoriesFromFirestore = async (): Promise<string[]> => {
  try {
    console.log('🔍 Fetching categories from Firestore...')
    
    const snapshot = await getDocs(collection(db, 'agents'))
    const categories = new Set<string>()
    
    snapshot.forEach(doc => {
      const data = doc.data()
      if (data.metadata?.category) {
        categories.add(data.metadata.category)
      }
    })
    
    const categoryArray = Array.from(categories).sort()
    console.log(`✅ Fetched ${categoryArray.length} categories:`, categoryArray)
    return categoryArray
    
  } catch (error) {
    console.error('❌ Error fetching categories from Firestore:', error)
    return []
  }
}

export const fetchProvidersFromFirestore = async (): Promise<string[]> => {
  try {
    console.log('🔍 Fetching providers from Firestore...')
    
    const snapshot = await getDocs(collection(db, 'agents'))
    const providers = new Set<string>()
    
    snapshot.forEach(doc => {
      const data = doc.data()
      if (data.provider) {
        providers.add(data.provider)
      }
    })
    
    const providerArray = Array.from(providers).sort()
    console.log(`✅ Fetched ${providerArray.length} providers:`, providerArray)
    return providerArray
    
  } catch (error) {
    console.error('❌ Error fetching providers from Firestore:', error)
    return []
  }
}
