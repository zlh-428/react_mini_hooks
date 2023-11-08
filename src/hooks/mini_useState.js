// 是否初次渲染
let isMounted = true;
// 当前处理的hook
let workInProgressHook = null;

const Test = () => {
  const [num, setNumber] = useState(0);

  console.log("isMounted?", isMounted);
  console.log("num:", num);

  return {
    onClick() {
      setNumber((num) => num + 1);
    },
  };
};

// 初始fiber ----- 每个react组件拥有一个fiber
const fiber = {
  stateNode: Test,
  memoizedState: null,
};

// 模仿useState实现原理
const useState = (initialState) => {
  let hook;

  /*
   * 如果是初次渲染，需要初始化一个hook类型的数据结构
   * memoizedState 当前值
   * next 指向下一个hook的指针
   * queue 更新队列
   */
  if (isMounted) {
    hook = {
      memoizedState: initialState,
      next: null,
      queue: {
        pending: null,
      },
    };
    // 如果当前fiber没有 memoizedState
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      // 将当前hook添加到fiber的next指针
      workInProgressHook.next = hook;
    }
    // 指向当前hook
    workInProgressHook = hook;
  } else {
    // 如果是更新渲染，需要从fiber的next指针中取出当前hook
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  // 获取初始state
  let baseState = hook.memoizedState;

  if (hook.queue.pending) {
    // 第一个执行的hook
    let firstUpdate = hook.queue.pending.next;

    do {
      // 取出hook需要执行的action
      const action = firstUpdate.action;
      // 计算新的state
      baseState = action(baseState);
      // 指向下一个hook
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending.next);

    // action计算完成 清空queue
    hook.queue.pending = null;
  }
  // 更新state
  hook.memoizedState = baseState;
  return [baseState, dispatchAction.bind(null, hook.queue)];
};

// action 队列
const dispatchAction = (queue, action) => {
  const update = {
    action,
    next: null,
  };

  /*
   * 如果当前队列为空 则将当前更新添加到队列头部
   * react 队列使用的是环形链表，方便做一些调度优先级的操作
   * 此处将所有 update 视为同一优先级
   */
  if (queue.pending === null) {
    update.next = update;
  } else {
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  queue.pending = update;

  schedule();
};

// 模仿react调度函数
const schedule = () => {
  // 每次执行调度将当前hook指向当前第一个hook
  workInProgressHook = fiber.memoizedState;
  const app = fiber.stateNode();
  isMounted = false;
  return app;
};

export default schedule;
