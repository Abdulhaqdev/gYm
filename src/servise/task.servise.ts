import { auth, db } from '@/firebase'
import { ITask, ITaskData } from '@/types/index'
import {
	endOfMonth,
	endOfWeek,
	isWithinInterval,
	startOfMonth,
	startOfWeek,
} from 'date-fns'
import { collection, getDocs, query, where } from 'firebase/firestore'

export const TaskServise = {
	getTasks: async () => {
		let weekTotal = 0
		let monthTotal = 0
		let total = 0

		const now = new Date()
		const weekStart = startOfWeek(now)
		const weekEnd = endOfWeek(now)
		const monthStart = startOfMonth(now)
		const monthEnd = endOfMonth(now)

		const q = query(
			collection(db, 'tasks'),
			where('userId', '==', auth.currentUser?.uid)
		)
		const querySnapshot = await getDocs(q)

		querySnapshot.docs.forEach(doc => {
			const data = doc.data()
			const TaskDate = new Date(data.startTime)
			const taskTime = data.totalTime || 0
			if (isWithinInterval(TaskDate, { start: weekStart, end: weekEnd })) {
				weekTotal += taskTime
			}
			if (isWithinInterval(TaskDate, { start: monthStart, end: monthEnd })) {
				monthTotal += taskTime
			}
			total += taskTime
		})

		const tasks = querySnapshot.docs.map(doc => ({
			...doc.data(),
			id: doc.id,
		})) as ITask[]

		const taskData: ITaskData = {
			tasks,
			weekTotal,
			monthTotal,
			total,
		}
		return taskData
	},
}
