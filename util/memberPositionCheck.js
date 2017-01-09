/**
 * Created by daeyoung on 2017-01-09.
 */
exports.getMemberPosition = function(rank){
    var position = '사원';

    if(rank=='0') position='부장';
    else if(rank=='1') position='차장';
    else if(rank=='2') position='과장';
    else if(rank=='3') position='대리';
    else if(rank=='4') position='주임';
    else if(rank=='5') position='사원';
    else position='기타';

    return position;
};
