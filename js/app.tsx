// 在ES6中，组件是基于类开发的（面向对象开发）
let { Component } = React;
let { render } = ReactDOM;
let { Router, Route, IndexRoute } = ReactRouter;

// 可以先将util定义成类，继承component
class Util extends Component {
	// 封装ajax方法
	ajax(url, fn) {
		// 创建xhr对象
		let xhr = new XMLHttpRequest();
		// 监听事件
		xhr.onreadystatechange = function() {
			// 监听状态
			if (xhr.readyState === 4) {
				// 监听状态码
				if (xhr.status === 200) {
					// 执行fn
					fn(JSON.parse(xhr.responseText))
				}
			}
		}
		// 打开请求
		xhr.open('GET', url, true);
		// 发送数据
		xhr.send(null);
	}
	// 将data数据转化成query的形式
	// {a:1,b:2} => ?a=1&b=2
	dataToQuery(data) {
		// 定义结果
		let result = '';
		// 解析data
		for (var i in data) {
			// i是key， data[i]是value
			result += '&' + i + '=' + data[i]
		}
		return '?' + result.slice(1);
	}
}

// 定义列表页组件
class List extends Util {
	constructor(props) {
		super(props);
		this.state = {
			list: []
		}
	}
	// 定义渲染列表的方法
	createList() {
		return this.state.list.map((obj, index) => (
			<li className="clearfix" key={index}>
				<a href={'#/detail/' + obj.id}>
					<img src={obj.img} alt="" />
					<div className="content">
						<h3>{obj.title}</h3>
						<p>{obj.content}<span className="list-comment">{'评论：' + obj.comment}</span></p>
					</div>
				</a>
			</li>
		))
	}
	render() {
		return (
			<div className="list">
				<ul>{this.createList()}</ul>
			</div>
		)
	}
	componentDidMount() {
		this.ajax('data/list.json', res => {
			// 更新状态
			if (res && res.errno === 0) {
				this.setState({list: res.data})
			}
		})
	}
}
// 定义详情页组件
class Detail extends Util {
	constructor(props) {
		super(props);
		this.state = {
			data: {}
		}
	}
	render() {
		// 缓存data
		let { data } = this.state;
		// console.log(data)
		// 定义内容
		let content = {
			__html: data.content
		}
		return (
			<div className="detail">
				<h1>{data.title}</h1>
				<p className="detai-state">
					<span className="detai-comment">{'评论数：' + data.comment}</span>
					<span className="detai-time">{data.time}</span>
				</p>
				<img src={data.img} alt="" />
				<p className="detail-content" dangerouslySetInnerHTML={content}></p>
				<a href={'#/comment/' + data.id} className="btn">查看更多评论</a>
			</div>
		)
	}
	componentDidMount() {
		this.ajax('data/detail.json?id=' + this.props.params.id, res => {
			// 更新状态存储数据
			if (res && res.errno === 0) {
				this.setState({
					data: res.data
				})
			}
		})
	}
}
// 定义评论页组件
class Comment extends Util {
	// 要将属性数据转化成状态数据
	constructor(props) {
		// 继承属性
		super(props);
		// 属性数据赋值状态
		this.state = {
			list: [],
			id: ''
		}
	}
	// 定义创建列表的方法
	createCommentList() {
		// console.log(this.state)
		// console.log(this.state)
		return this.state.list.map((obj, index) => (
			<li key={index}>
				<h3>{obj.user}</h3>
				<p>{obj.content}</p>
				<span>{obj.time}</span>
			</li>
		))
	}
	// 定义提交数据的方法
	submitData() {
		// 1 为提交按钮绑定事件
		// 2 获取输入框的内容
		// 约束性通过状态， 非约束性的通过ref
		var inp = this.refs.msgInput
		var val = inp.value;
		// 3 校验输入框的内容: 必须有内容，不能全是空白符
		if (/^\s*$/.test(val)) {
			// 提示用户，终止操作
			alert('请输入内容，再提交！');
			return;
		}
		// 4 创建提交数据
		// 提交的数据有四个字段：新闻id，用户名，时间，内容
		let time = new Date();
		let data = {
			id: this.state.id,
			user: '冷月',
			time: '刚刚：' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds(),
			content: val
		}
		// 5 发送请求 
		// 理论上提交要通过post请求，我们只实现了get请求，所以我们要将数据变成query的形式
		this.ajax('data/addComment.json' + this.dataToQuery(data), res => {
			// console.log(res, 567)
			if (res && res.errno === 0) {
				// 要在前面显示最新的数据，我们要在前面更新list
				let list = this.state.list;
				list.unshift(data)
				// 6 更新列表
				this.setState({
					list: list
				})	
				// 7 情况输入框，提示用户
				inp.value = '';
				alert('恭喜你，提交成功！');
			}
		})
	}
	render() {
		// console.log(this.props)
		return (
			<div className="comment">
				<div className="container">
					<div className="message">
						<textarea ref="msgInput" placeholder="文明上网，理性发言！"></textarea>
					</div>
					<div className="btn clearfix">
						<span onClick={this.submitData.bind(this)}>提交</span>
					</div>
				</div>
				<ul>{this.createCommentList()}</ul>
			</div>
		)
	}
	componentDidMount() {
		this.ajax('data/comment.json?id=' + this.props.params.id, res => {
			// 2 将返回的数据存储
			if (res && res.errno === 0) {
				// 3 将数据传递给comment组件
				this.setState({
					list: res.data.list,
					id: res.data.id
				})
			}
		})
	}
}
// 定义header组件
class Header extends Component {
	// 路由的返回逻辑交给浏览器
	goBack() {
		window.history.go(-1)
	}
	render() {
		return (
			<header className="header">
				<div className="login">登录</div>
				<div className="go-back" onClick={this.goBack}><span className="arrow"><span className="arrow"></span></span></div>
				<h1>点指新闻</h1>
			</header>
		)
	}
}


// 然后再让app继承util
// 定义组件
class App extends Component {
	// 渲染输出虚拟DOM树
	render() {
		return (
			<div className="main">
				<Header></Header>
				{this.props.children}
			</div>
		)
	}
}
// 定义规则
let routes = (
	<Router>
		<Route path="/" component={App}>
			<IndexRoute component={List}></IndexRoute>
			<Route path="detail/:id" component={Detail}></Route>
			<Route path="comment/:id" component={Comment}></Route>
		</Route>
	</Router>
)

// 渲染组件用ReactDOM.render
render(routes, document.getElementById('app'));