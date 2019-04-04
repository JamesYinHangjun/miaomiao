<template>
    <div class="city_body">
        <!-- <div class="city_list">
            <div class="city_hot">
                <h2>热门城市</h2>
                <ul class="clearfix">
                    <li>上海</li>
                </ul>
            </div>
            <div class="city_sort">
                <div>
                    <h2>A</h2>
                    <ul>
                        <li>阿拉善盟</li>
                        <li>鞍山</li>
                        <li>安庆</li>
                        <li>安阳</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="city_index">
            <ul>
                <li>A</li>
                <li>B</li>
                <li>C</li>
                <li>D</li>
                <li>E</li>
            </ul>
        </div> -->
        <div class="city_list">
            <Loading v-if="isLoading" />
            <Scroller v-else ref="city_List">
                <div>
                    <div class="city_hot">
                        <h2>热门城市</h2>
                        <ul class="clearfix">
                            <li v-for="item in hotList" :key="item.id" @tap="handleToCity(item.nm , item.id)">
                                {{ item.nm }}
                            </li>
                        </ul>
                    </div>

                    <!-- 城市分类 cityList -->
                    <div class="city_sort" ref="city_sort">
                        <div v-for="item in cityList" :key="item.index">
                            <h2>{{ item.index }}</h2>
                            <ul>
                                <li v-for="itemList in item.list" :key="itemList.id" @tap="handleToCity(itemList.nm , itemList.id)">
                                    {{ itemList.nm }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Scroller>
        </div>

        <!-- 右边索引的映射 -->
        <div class="city_index">
            <ul>
                <li v-for="(item,index) in cityList" :key="item.index" @touchstart="handleToIndex(index)">
                    {{ item.index }}
                </li>
            </ul>
        </div>
    </div>
</template>

 <!-- 城市的数据接口  39.97.33.178/api/cityList -->
<script>
export default {
    name : 'City',
    data(){
        return {
            cityList : [],
            hotList : [],
            isLoading : true
        }
    },
    mounted(){
        var cityList = window.localStorage.getItem('cityList');
        var hotList = window.localStorage.getItem('hotList');

        if(cityList && hotList){
            this.cityList = JSON.parse(cityList);
            this.hotList = JSON.parse(hotList);
            this.isLoading = false;
        }
        else{
            this.axios.get('/api/cityList').then((res)=>{
                var msg = res.data.msg;
                if(msg === 'ok'){
                    this.isLoading = false;
                    var cities = res.data.data.cities;
                    //[ { index : 'A' , list : [{ nm : '阿城' , id : 123 }] } ]
                    var { cityList , hotList } = this.formatCityList(cities);
                    // 这时，已经拿到 cityList 和 hotList 两个结果集了

                    // 把拿到的 cityList 赋值给 data 中的 cityList,
                    // 然后就可以渲染到页面中了
                    this.cityList = cityList;
                    this.hotList = hotList;

                    window.localStorage.setItem('cityList' , JSON.stringify(cityList));
                    window.localStorage.setItem('hotList' , JSON.stringify(hotList));
                }
            });
        }
    },
    methods : {
        formatCityList(cities){
            // 城市分类
            var cityList = [];
            // 热门城市,将 isHot 为 1 (热门)的字段筛选出来
            var hotList = [];

            // 热门城市数组级的添加
            for(var i=0;i<cities.length;i++){
                if(cities[i].isHot === 1){
                    hotList.push( cities[i] );
                }
            }

            // 归类cities 数据集中的城市属于哪个字母开头的
            // nm 表示城市名字， py 表示 城市的 拼音
            for(var i=0;i<cities.length;i++){
                // 城市拼音的 首字母 firstLetter
                var firstLetter = cities[i].py.substring(0,1).toUpperCase();

                // 拿到首字母后，去调用 toCom(firstLetter)
                // 如果 不在 cityList 的城市结果集中,就加入进去
                if(toCom(firstLetter)){  //新添加index
                    cityList.push({ index : firstLetter , list : [ { nm : cities[i].nm , id : cities[i].id } ] });
                }
                else{   //累加到已有index中
                    for(var j=0;j<cityList.length;j++){
                        if( cityList[j].index === firstLetter ){
                            cityList[j].list.push( { nm : cities[i].nm , id : cities[i].id } );
                        }
                    }
                }
            }

            // 判断字母的排序 保证按照 A B C D E 排列
            cityList.sort((n1,n2)=>{
                if( n1.index > n2.index ){
                    return 1;
                }
                else if(n1.index < n2.index){
                    return -1;
                }
                else{
                    return 0;
                }
            });



            function toCom(firstLetter){
                for(var i=0;i<cityList.length;i++){
                    if( cityList[i].index ===  firstLetter){
                        return false;
                    }
                }
                return true;
            }

            //将得到的两个结果集返回到外面
            return {
                cityList,
                hotList
            };

        },

        // 当点击字母索引时，会跳到对应的城市去
        handleToIndex(index){
            var h2 = this.$refs.city_sort.getElementsByTagName('h2');
            //this.$refs.city_sort.parentNode.scrollTop = h2[index].offsetTop;
            this.$refs.city_List.toScrollTop(-h2[index].offsetTop);
        },
        handleToCity(nm,id){
            this.$store.commit('city/CITY_INFO',{ nm , id });
            window.localStorage.setItem('nowNm',nm);
            window.localStorage.setItem('nowId',id);
            this.$router.push('/movie/nowPlaying');
        }
    }
}
</script>

<style scoped>
#content .city_body{ margin-top: 45px; display: flex; width:100%; position: absolute; top: 0; bottom: 0;}
.city_body .city_list{ flex:1; overflow: auto; background: #FFF5F0;}
.city_body .city_list::-webkit-scrollbar{
    background-color:transparent;
    width:0;
}
.city_body .city_hot{ margin-top: 20px;}
.city_body .city_hot h2{ padding-left: 15px; line-height: 30px; font-size: 14px; background:#F0F0F0; font-weight: normal;}
.city_body .city_hot ul li{ float: left; background: #fff; width: 29%; height: 33px; margin-top: 15px; margin-left: 3%; padding: 0 4px; border: 1px solid #e6e6e6; border-radius: 3px; line-height: 33px; text-align: center; box-sizing: border-box;}
.city_body .city_sort div{ margin-top: 20px;}
.city_body .city_sort h2{ padding-left: 15px; line-height: 30px; font-size: 14px; background:#F0F0F0; font-weight: normal;}
.city_body .city_sort ul{ padding-left: 10px; margin-top: 10px;}
.city_body .city_sort ul li{ line-height: 30px; line-height: 30px;}
.city_body .city_index{ width:20px; display: flex; flex-direction:column; justify-content:center; text-align: center; border-left:1px #e6e6e6 solid;}
</style>
